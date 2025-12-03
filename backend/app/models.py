"""
Pydantic models for API request/response validation.
"""

from datetime import date, datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, HttpUrl, EmailStr


# Type definitions
SeverityType = Literal["Low", "Medium", "High", "Critical"]
CategoryType = Literal["Conflict", "Disaster", "Health", "Humanitarian", "Climate"]


# Authentication Models
class UserRegister(BaseModel):
    """User registration model."""
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    """User login model."""
    email: EmailStr
    password: str


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    """User response model."""
    id: int
    email: str
    created_at: datetime

    class Config:
        from_attributes = True


class CrisisBase(BaseModel):
    """Base crisis model."""
    title: str
    category: CategoryType
    country: str
    latitude: float
    longitude: float
    severity: SeverityType
    summary: str
    description: str
    start_date: date
    is_active: bool = True


class CrisisResponse(CrisisBase):
    """Crisis response model."""
    id: int

    class Config:
        from_attributes = True


class CrisisListResponse(BaseModel):
    """List of crises response."""
    crises: List[CrisisResponse]
    total: int


class CharityBase(BaseModel):
    """Base charity model."""
    name: str
    description: str
    donation_url: str
    crisis_id: int


class CharityResponse(CharityBase):
    """Charity response model."""
    id: int

    class Config:
        from_attributes = True


class CharityListResponse(BaseModel):
    """List of charities response."""
    charities: List[CharityResponse]


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "ok"


# Payment Models
class CreatePaymentIntent(BaseModel):
    """Create payment intent request."""
    amount: int  # Amount in cents (e.g., 1000 = $10.00)
    crisis_id: int
    charity_id: Optional[int] = None
    donor_email: Optional[EmailStr] = None
    donor_name: Optional[str] = None


class PaymentIntentResponse(BaseModel):
    """Payment intent response."""
    client_secret: str
    payment_intent_id: str
    amount: int
    currency: str
    status: str


class WebhookEvent(BaseModel):
    """Stripe webhook event."""
    type: str
    data: dict


class DonationRecord(BaseModel):
    """Donation record for database storage."""
    id: int
    payment_intent_id: str
    crisis_id: int
    charity_id: Optional[int]
    amount: int
    currency: str
    status: str
    donor_email: Optional[str]
    donor_name: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True
