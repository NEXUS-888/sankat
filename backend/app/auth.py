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
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable not set")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days

# Cookie Configuration
COOKIE_NAME = "auth_token"
COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days in seconds

# CSRF Configuration
CSRF_TOKEN_LENGTH = 32
CSRF_COOKIE_NAME = "csrf_token"
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


def set_csrf_cookie(response: Response, csrf_token: str) -> None:
    """Set CSRF token cookie"""
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        max_age=COOKIE_MAX_AGE,
        httponly=False, # Allow JS to read this cookie
        secure=False,   # Set to True in production with HTTPS
        samesite="lax",
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    """Clear authentication cookie"""
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
    )


def clear_csrf_cookie(response: Response) -> None:
    """Clear CSRF cookie"""
    response.delete_cookie(
        key=CSRF_COOKIE_NAME,
        path="/",
    )


def generate_csrf_token() -> str:
    """Generate a new CSRF token"""
    return secrets.token_hex(CSRF_TOKEN_LENGTH)


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


def verify_csrf(request: Request) -> None:
    """Verify CSRF token for state-changing requests using double submit cookie pattern."""
    csrf_token_header = request.headers.get("X-CSRF-Token")
    csrf_token_cookie = request.cookies.get(CSRF_COOKIE_NAME)

    if not csrf_token_header:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing from header",
        )

    if not csrf_token_cookie:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="CSRF token missing from cookie",
        )

    if not secrets.compare_digest(csrf_token_header, csrf_token_cookie):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid CSRF token",
        )
