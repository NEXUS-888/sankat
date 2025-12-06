"""
Payment processing with Stripe
"""
import os
import stripe
from typing import Optional
from dotenv import load_dotenv

load_dotenv()

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")


def create_payment_intent(
    amount: int,
    currency: str = "usd",
    metadata: Optional[dict] = None
) -> dict:
    """
    Create a Stripe payment intent
    
    Args:
        amount: Amount in cents (e.g., 1000 = $10.00)
        currency: Currency code (default: usd)
        metadata: Additional data to attach to the payment
    
    Returns:
        Payment intent object with client_secret
    """
    try:
        payment_intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata=metadata or {},
            automatic_payment_methods={"enabled": True},
        )
        
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id,
            "amount": payment_intent.amount,
            "currency": payment_intent.currency,
            "status": payment_intent.status,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def verify_webhook_signature(payload: bytes, signature: str) -> dict:
    """
    Verify Stripe webhook signature
    
    Args:
        payload: Raw request body
        signature: Stripe-Signature header value
    
    Returns:
        Verified event object
    """
    try:
        event = stripe.Webhook.construct_event(
            payload, signature, STRIPE_WEBHOOK_SECRET
        )
        return event
    except ValueError:
        raise Exception("Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise Exception("Invalid signature")


def retrieve_payment_intent(payment_intent_id: str) -> dict:
    """
    Retrieve payment intent details
    
    Args:
        payment_intent_id: The payment intent ID
    
    Returns:
        Payment intent object
    """
    try:
        payment_intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        return {
            "id": payment_intent.id,
            "amount": payment_intent.amount,
            "currency": payment_intent.currency,
            "status": payment_intent.status,
            "metadata": payment_intent.metadata,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def create_customer(email: str, name: Optional[str] = None, metadata: Optional[dict] = None) -> dict:
    """
    Create a Stripe customer
    
    Args:
        email: Customer email
        name: Customer name (optional)
        metadata: Additional customer data
    
    Returns:
        Customer object
    """
    try:
        customer = stripe.Customer.create(
            email=email,
            name=name,
            metadata=metadata or {},
        )
        return {
            "customer_id": customer.id,
            "email": customer.email,
            "name": customer.name,
        }
    except stripe.error.StripeError as e:
        raise Exception(f"Stripe error: {str(e)}")


def create_donation_payment(
    amount: int,
    crisis_id: int,
    charity_id: Optional[int] = None,
    donor_email: Optional[str] = None,
    donor_name: Optional[str] = None,
    user_id: Optional[int] = None,
) -> dict:
    """
    Create a payment intent for crisis donation
    
    Args:
        amount: Donation amount in cents
        crisis_id: ID of the crisis being supported
        charity_id: Optional charity ID if donating to specific organization
        donor_email: Donor email address
        donor_name: Donor name
        user_id: User ID for tracking donations
    
    Returns:
        Payment intent with client_secret
    """
    metadata = {
        "crisis_id": str(crisis_id),
        "donation_type": "crisis_relief",
    }
    
    if charity_id:
        metadata["charity_id"] = str(charity_id)
    if donor_email:
        metadata["donor_email"] = donor_email
    if donor_name:
        metadata["donor_name"] = donor_name
    if user_id:
        metadata["user_id"] = str(user_id)
    
    return create_payment_intent(
        amount=amount,
        currency="usd",
        metadata=metadata
    )
