"""
Database connection and query utilities.
"""

import os
from contextlib import contextmanager
from typing import Generator, Any, List, Dict, Optional

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv

load_dotenv()


def get_connection_params() -> str:
    """Get database connection parameters from environment as connection string."""
    host = os.getenv("DB_HOST", "localhost")
    port = os.getenv("DB_PORT", "5432")
    dbname = os.getenv("DB_NAME", "globemap")
    user = os.getenv("DB_USER", "postgres")
    password = os.getenv("DB_PASSWORD", "postgres")
    
    return f"host={host} port={port} dbname={dbname} user={user} password={password}"


@contextmanager
def get_db_connection() -> Generator:
    """Context manager for database connections."""
    with psycopg.connect(get_connection_params()) as conn:
        yield conn


@contextmanager
def get_db_cursor() -> Generator:
    """Context manager for database cursors with dict results."""
    with get_db_connection() as conn:
        with conn.cursor(row_factory=dict_row) as cursor:
            try:
                yield cursor
                conn.commit()
            except Exception:
                conn.rollback()
                raise


def fetch_crises(
    search: Optional[str] = None,
    category: Optional[str] = None,
    severity: Optional[str] = None
) -> List[Dict[str, Any]]:
    """Fetch crises with optional filters."""
    with get_db_cursor() as cursor:
        query = "SELECT * FROM crises WHERE is_active = TRUE"
        params: List[Any] = []
        
        if search:
            query += """ AND (
                title ILIKE %s OR 
                summary ILIKE %s OR 
                description ILIKE %s OR 
                country ILIKE %s
            )"""
            search_param = f"%{search}%"
            params.extend([search_param] * 4)
        
        if category:
            query += " AND category = %s"
            params.append(category)
        
        if severity:
            query += " AND severity = %s"
            params.append(severity)
        
        query += " ORDER BY CASE severity WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END, start_date DESC"
        
        cursor.execute(query, params)
        return cursor.fetchall()


def fetch_crisis_by_id(crisis_id: int) -> Optional[Dict[str, Any]]:
    """Fetch a single crisis by ID."""
    with get_db_cursor() as cursor:
        cursor.execute("SELECT * FROM crises WHERE id = %s", (crisis_id,))
        return cursor.fetchone()


def fetch_charities(crisis_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Fetch charities, optionally filtered by crisis ID."""
    with get_db_cursor() as cursor:
        if crisis_id:
            cursor.execute("SELECT * FROM charities WHERE crisis_id = %s ORDER BY name", (crisis_id,))
        else:
            cursor.execute("SELECT * FROM charities ORDER BY name")
        return cursor.fetchall()


def fetch_charities_by_crisis(crisis_id: int) -> List[Dict[str, Any]]:
    """Fetch all charities for a specific crisis."""
    return fetch_charities(crisis_id)


def create_donation_record(
    crisis_id: int,
    amount: int,
    currency: str,
    stripe_payment_intent_id: str,
    status: str,
    user_id: Optional[int] = None,
    charity_id: Optional[int] = None,
) -> Dict[str, Any]:
    """Create a record for a new donation."""
    with get_db_cursor() as cursor:
        query = """
            INSERT INTO donations (
                crisis_id, amount, currency, stripe_payment_intent_id, status, user_id, charity_id
            ) VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, created_at
        """
        params = (
            crisis_id, amount, currency, stripe_payment_intent_id, status, user_id, charity_id
        )
        cursor.execute(query, params)
        new_donation = cursor.fetchone()
        return new_donation


def fetch_user_donations(user_id: int) -> List[Dict[str, Any]]:
    """Fetch all donations made by a user with crisis and charity details."""
    with get_db_cursor() as cursor:
        query = """
            SELECT 
                d.id,
                d.amount,
                d.currency,
                d.created_at,
                c.title as crisis_title,
                c.country as crisis_country,
                ch.name as charity_name
            FROM donations d
            JOIN crises c ON d.crisis_id = c.id
            LEFT JOIN charities ch ON d.charity_id = ch.id
            WHERE d.user_id = %s AND d.status = 'succeeded'
            ORDER BY d.created_at DESC
        """
        cursor.execute(query, (user_id,))
        return cursor.fetchall()


def fetch_user_donation_summary(user_id: int) -> Dict[str, Any]:
    """Fetch summary statistics for a user's donations."""
    with get_db_cursor() as cursor:
        query = """
            SELECT 
                COALESCE(SUM(d.amount), 0)::integer as total_amount,
                COALESCE(MAX(d.currency), 'USD') as currency,
                COUNT(DISTINCT d.crisis_id)::integer as crisis_count,
                COUNT(DISTINCT CASE WHEN d.charity_id IS NOT NULL THEN d.charity_id END)::integer as charity_count
            FROM donations d
            WHERE d.user_id = %s AND d.status = 'succeeded'
        """
        cursor.execute(query, (user_id,))
        result = cursor.fetchone()
        
        # If no result or all values are None/0, return default
        if not result or result.get('total_amount') is None:
            return {
                'total_amount': 0,
                'currency': 'USD',
                'crisis_count': 0,
                'charity_count': 0
            }
        
        return result
