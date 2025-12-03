"""
Global Problems Map - FastAPI Backend
Main application entry point.
"""

from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query, Depends, Response, Request
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    CrisisResponse,
    CrisisListResponse,
    CharityResponse,
    CharityListResponse,
    HealthResponse,
    CategoryType,
    SeverityType,
    UserRegister,
    UserLogin,
    Token,
    UserResponse,
    CreatePaymentIntent,
    PaymentIntentResponse,
)
from .database import (
    fetch_crises,
    fetch_crisis_by_id,
    fetch_charities,
    fetch_charities_by_crisis,
)
from .auth import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user,
    set_auth_cookie,
    clear_auth_cookie,
    generate_csrf_token,
    store_csrf_token,
    verify_csrf,
)
from .payments import (
    create_donation_payment,
    retrieve_payment_intent,
    verify_webhook_signature,
)

# Create FastAPI app
app = FastAPI(
    title="Global Problems Map API",
    description="API for tracking global crises and connecting donors with relief organizations.",
    version="1.0.0",
)

# Configure CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "http://localhost:8080",  # Alternative Vite port
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint.
    Returns a simple status to verify the API is running.
    """
    return {"status": "ok"}


@app.get("/crises/", response_model=CrisisListResponse, tags=["Crises"])
async def get_crises(
    q: Optional[str] = Query(None, description="Search text in title, summary, description, country"),
    category: Optional[CategoryType] = Query(None, description="Filter by crisis category"),
    severity: Optional[SeverityType] = Query(None, description="Filter by severity level"),
):
    """
    Get list of active crises with optional filtering.
    
    - **q**: Search across title, summary, description, and country fields
    - **category**: Filter by category (Conflict, Disaster, Health, Humanitarian, Climate)
    - **severity**: Filter by severity level (Low, Medium, High, Critical)
    """
    try:
        crises = fetch_crises(search=q, category=category, severity=severity)
        return {
            "crises": [CrisisResponse(**crisis) for crisis in crises],
            "total": len(crises),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/crises/{crisis_id}", response_model=CrisisResponse, tags=["Crises"])
async def get_crisis(crisis_id: int):
    """
    Get detailed information about a specific crisis.
    """
    crisis = fetch_crisis_by_id(crisis_id)
    if not crisis:
        raise HTTPException(status_code=404, detail="Crisis not found")
    return CrisisResponse(**crisis)


@app.get("/charities/", response_model=CharityListResponse, tags=["Charities"])
async def get_charities(
    crisis_id: Optional[int] = Query(None, description="Filter charities by crisis ID"),
):
    """
    Get list of charities, optionally filtered by crisis.
    """
    try:
        charities = fetch_charities(crisis_id=crisis_id)
        return {"charities": [CharityResponse(**charity) for charity in charities]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


@app.get("/charities/by-crisis/{crisis_id}", response_model=CharityListResponse, tags=["Charities"])
async def get_charities_by_crisis(crisis_id: int):
    """
    Get all charities associated with a specific crisis.
    """
    # Verify crisis exists
    crisis = fetch_crisis_by_id(crisis_id)
    if not crisis:
        raise HTTPException(status_code=404, detail="Crisis not found")
    
    charities = fetch_charities_by_crisis(crisis_id)
    return {"charities": [CharityResponse(**charity) for charity in charities]}


# ============ Authentication Routes ============

@app.post("/auth/register", tags=["Authentication"])
async def register(user: UserRegister, response: Response):
    """
    Register a new user with email and password.
    Sets an httpOnly cookie with JWT token upon successful registration.
    """
    from .database import get_db_connection
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Check if user already exists
            cursor.execute("SELECT id FROM users WHERE email = %s", (user.email,))
            existing_user = cursor.fetchone()
            
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Hash password and create user
            hashed_password = hash_password(user.password)
            cursor.execute(
                "INSERT INTO users (email, password_hash) VALUES (%s, %s) RETURNING id",
                (user.email, hashed_password)
            )
            user_id = cursor.fetchone()[0]
            conn.commit()
            
            cursor.close()
        
        # Create access token and set httpOnly cookie
        access_token = create_access_token(data={"user_id": user_id, "email": user.email})
        set_auth_cookie(response, access_token)
        
        # Generate CSRF token
        csrf_token = generate_csrf_token()
        store_csrf_token(csrf_token, user_id)
        
        return {
            "message": "Registration successful",
            "user": {"id": user_id, "email": user.email},
            "csrf_token": csrf_token,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


@app.post("/auth/login", tags=["Authentication"])
async def login(user: UserLogin, response: Response):
    """
    Login with email and password.
    Sets an httpOnly cookie with JWT token upon successful authentication.
    """
    from .database import get_db_connection
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Fetch user by email
            cursor.execute(
                "SELECT id, email, password_hash FROM users WHERE email = %s",
                (user.email,)
            )
            db_user = cursor.fetchone()
            cursor.close()
        
        if not db_user:
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        user_id, email, password_hash = db_user
        
        # Verify password
        if not verify_password(user.password, password_hash):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        # Create access token and set httpOnly cookie
        access_token = create_access_token(data={"user_id": user_id, "email": email})
        set_auth_cookie(response, access_token)
        
        # Generate CSRF token
        csrf_token = generate_csrf_token()
        store_csrf_token(csrf_token, user_id)
        
        return {
            "message": "Login successful",
            "user": {"id": user_id, "email": email},
            "csrf_token": csrf_token,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


@app.get("/auth/me", response_model=UserResponse, tags=["Authentication"])
async def get_current_user_info(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.
    Requires a valid JWT token in httpOnly cookie.
    """
    from .database import get_db_connection
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT id, email, created_at FROM users WHERE id = %s",
                (current_user["user_id"],)
            )
            db_user = cursor.fetchone()
            cursor.close()
        
        if not db_user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user_id, email, created_at = db_user
        
        return UserResponse(id=user_id, email=email, created_at=created_at)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch user: {str(e)}")


@app.get("/auth/csrf-token", tags=["Authentication"])
async def get_csrf_token(request: Request, current_user: dict = Depends(get_current_user)):
    """
    Get a CSRF token for the authenticated user.
    This token must be included in X-CSRF-Token header for state-changing requests.
    """
    csrf_token = generate_csrf_token()
    store_csrf_token(csrf_token, current_user["user_id"])
    
    return {"csrf_token": csrf_token}


@app.post("/auth/logout", tags=["Authentication"])
async def logout(response: Response, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Logout the current user by clearing the authentication cookie.
    """
    # Verify CSRF token
    verify_csrf(request, current_user)
    
    # Clear authentication cookie
    clear_auth_cookie(response)
    
    return {"message": "Logout successful"}


@app.post("/auth/refresh", tags=["Authentication"])
async def refresh_token(response: Response, request: Request, current_user: dict = Depends(get_current_user)):
    """
    Refresh the authentication token.
    Issues a new JWT token in httpOnly cookie.
    """
    # Create new access token
    access_token = create_access_token(
        data={"user_id": current_user["user_id"], "email": current_user["email"]}
    )
    set_auth_cookie(response, access_token)
    
    # Generate new CSRF token
    csrf_token = generate_csrf_token()
    store_csrf_token(csrf_token, current_user["user_id"])
    
    return {
        "message": "Token refreshed",
        "csrf_token": csrf_token,
    }


# ============================================
# Payment Routes
# ============================================

@app.post("/payments/create-intent", response_model=PaymentIntentResponse, tags=["Payments"])
async def create_payment_intent_endpoint(
    payment_data: CreatePaymentIntent,
    request: Request,
):
    """
    Create a Stripe payment intent for donation.
    
    - **amount**: Donation amount in cents (e.g., 1000 = $10.00)
    - **crisis_id**: ID of the crisis to support
    - **charity_id**: Optional specific charity to donate to
    - **donor_email**: Optional donor email for receipt
    - **donor_name**: Optional donor name
    """
    try:
        # Verify CSRF for authenticated users (optional for donations)
        # For public donations, you may want to skip CSRF
        
        # Create payment intent
        payment_intent = create_donation_payment(
            amount=payment_data.amount,
            crisis_id=payment_data.crisis_id,
            charity_id=payment_data.charity_id,
            donor_email=payment_data.donor_email,
            donor_name=payment_data.donor_name,
        )
        
        return PaymentIntentResponse(**payment_intent)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment creation failed: {str(e)}")


@app.get("/payments/status/{payment_intent_id}", tags=["Payments"])
async def get_payment_status(payment_intent_id: str):
    """
    Get the status of a payment intent.
    """
    try:
        payment_intent = retrieve_payment_intent(payment_intent_id)
        return payment_intent
    except Exception as e:
        raise HTTPException(status_code=404, detail=f"Payment not found: {str(e)}")


@app.post("/payments/webhook", tags=["Payments"])
async def stripe_webhook(request: Request):
    """
    Webhook endpoint for Stripe events.
    Handles payment confirmations and updates.
    """
    payload = await request.body()
    signature = request.headers.get("stripe-signature")
    
    if not signature:
        raise HTTPException(status_code=400, detail="Missing Stripe signature")
    
    try:
        event = verify_webhook_signature(payload, signature)
        
        # Handle different event types
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            # TODO: Record successful donation in database
            print(f"✅ Payment succeeded: {payment_intent['id']}")
            print(f"   Amount: ${payment_intent['amount'] / 100}")
            print(f"   Crisis ID: {payment_intent['metadata'].get('crisis_id')}")
            
        elif event["type"] == "payment_intent.payment_failed":
            payment_intent = event["data"]["object"]
            print(f"❌ Payment failed: {payment_intent['id']}")
            
        return {"status": "success"}
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Webhook error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
