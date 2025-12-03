"""
Authentication utilities for JWT tokens and password hashing
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
import bcrypt
import secrets
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
from dotenv import load_dotenv

load_dotenv()

# JWT Configuration
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Cookie Configuration
COOKIE_NAME = "auth_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days in seconds

# CSRF Configuration
CSRF_TOKEN_LENGTH = 32
csrf_tokens = {}  # In production, use Redis or a proper session store

# HTTP Bearer token security (kept for backward compatibility)
security = HTTPBearer(auto_error=False)


def hash_password(password: str) -> str:
    """Hash a plain password using bcrypt"""
    # Bcrypt has a max password length of 72 bytes
    password_bytes = password.encode('utf-8')[:72]
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a bcrypt hash"""
    password_bytes = plain_password.encode('utf-8')[:72]
    hashed_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode and verify a JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )


def set_auth_cookie(response: Response, token: str) -> None:
    """Set httpOnly authentication cookie"""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,  # Prevents JavaScript access (XSS protection)
        secure=False,    # Set to True in production with HTTPS
        samesite="lax",  # CSRF protection
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """Clear authentication cookie"""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
    )


def generate_csrf_token() -> str:
    """Generate a new CSRF token"""
    return secrets.token_hex(CSRF_TOKEN_LENGTH)


def store_csrf_token(token: str, user_id: int) -> None:
    """Store CSRF token (in production, use Redis or session store)"""
    csrf_tokens[token] = user_id


def validate_csrf_token(token: str, user_id: int) -> bool:
    """Validate CSRF token"""
    return csrf_tokens.get(token) == user_id


def get_token_from_cookie(request: Request) -> Optional[str]:
    """Extract JWT token from httpOnly cookie"""
    return request.cookies.get(COOKIE_NAME)


async def get_current_user(request: Request) -> dict:
    """Dependency to get the current user from JWT token in cookie"""
    # Try to get token from cookie first
    token = get_token_from_cookie(request)
    
    # Fallback to Authorization header for backward compatibility
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    
    payload = decode_token(token)
    
    user_id: int = payload.get("user_id")
    email: str = payload.get("email")
    
    if user_id is None or email is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )
    
    return {"user_id": user_id, "email": email}


def verify_csrf(request: Request, current_user: dict) -> None:
    """Verify CSRF token for state-changing requests"""
    csrf_token = request.headers.get("X-CSRF-Token")
    
    if not csrf_token:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing",
        )
    
    if not validate_csrf_token(csrf_token, current_user["user_id"]):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token",
        )
