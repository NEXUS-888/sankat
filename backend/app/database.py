"""
Database connection and query utilities.
"""

import os
from contextlib import contextmanager
from typing import Generator, Any, List, Dict, Optional

import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()


def get_connection_params() -> Dict[str, Any]:
    """Get database connection parameters from environment."""
    return {
        "host": os.getenv("DB_HOST", "localhost"),
        "port": os.getenv("DB_PORT", "5432"),
        "database": os.getenv("DB_NAME", "globemap"),
        "user": os.getenv("DB_USER", "postgres"),
        "password": os.getenv("DB_PASSWORD", "postgres"),
    }


@contextmanager
def get_db_connection() -> Generator:
    """Context manager for database connections."""
    conn = psycopg2.connect(**get_connection_params())
    try:
        yield conn
    finally:
        conn.close()


@contextmanager
def get_db_cursor() -> Generator:
    """Context manager for database cursors with dict results."""
    with get_db_connection() as conn:
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        try:
            yield cursor
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            cursor.close()


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
