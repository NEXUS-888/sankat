"""
Pydantic models for API request/response validation.
"""

from datetime import date
from typing import Optional, List, Literal
from pydantic import BaseModel, HttpUrl


# Type definitions
SeverityType = Literal["Low", "Medium", "High", "Critical"]
CategoryType = Literal["Conflict", "Disaster", "Health", "Humanitarian", "Climate"]


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
