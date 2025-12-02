"""
Global Problems Map - FastAPI Backend
Main application entry point.
"""

from typing import Optional, List

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .models import (
    CrisisResponse,
    CrisisListResponse,
    CharityResponse,
    CharityListResponse,
    HealthResponse,
    CategoryType,
    SeverityType,
)
from .database import (
    fetch_crises,
    fetch_crisis_by_id,
    fetch_charities,
    fetch_charities_by_crisis,
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
