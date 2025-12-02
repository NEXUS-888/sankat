# Global Problems Map - Sankat

A minimal overview of the project with only essential details.

## Overview
Sankat visualizes global crises on an interactive map and links to relevant charities. Frontend uses React/Vite/MapLibre; backend uses FastAPI/PostgreSQL.

## Environment Variables

Frontend (`.env` in project root):
```
VITE_MAPTILER_KEY=your_maptiler_api_key
```

Backend (`backend/.env`):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globemap
DB_USER=postgres
DB_PASSWORD=your_password
```

## Setup & Run

### Frontend
- Ensure Node.js (>=18) and npm are installed
- In project root:
  - `npm install`
  - Create `.env` and set `VITE_MAPTILER_KEY`
  - Start dev server: `npm run dev`
- Server runs at `http://localhost:8080/`

### Backend
- Ensure PostgreSQL is installed and running on `localhost:5432`
- Setup steps:
  ```bash
  cd backend
  
  # Create and activate virtual environment (optional)
  python -m venv .venv
  source .venv/bin/activate  # Linux/Mac
  # .venv\Scripts\activate   # Windows
  
  # Install dependencies
  pip install -r requirements.txt
  
  # Create .env file with DB credentials (copy from .env.example)
  cp .env.example .env
  
  # Initialize database
  psql -U postgres -d globemap -f database_schema.sql
  
  # Seed sample data
  python seed_data.py
  
  # Start the API server (make sure you're in backend/ directory)
  uvicorn app.main:app --reload --port 8000
  ```
- **Note**: If Python 3.13 has compatibility issues with dependencies, use the project root venv:
  ```bash
  cd backend
  /path/to/project/.venv/bin/python -m uvicorn app.main:app --reload --port 8000
  ```
- API runs at `http://localhost:8000/` (Docs: `/docs`)

## How It Works
- Frontend (Vite React) requests crisis data from the FastAPI backend
- MapView uses MapLibre with MapTiler styles to render markers by `latitude/longitude`
- Filtering/search parameters (`q`, `category`, `severity`) are passed to `/crises/`
- Selecting a crisis focuses the map and shows details with linked charities

## Key API Endpoints
- GET /health
- GET /crises/  (q, category, severity)
- GET /crises/{id}
- GET /charities/  (crisis_id)

## Tech Stack
Frontend: React, Vite, TypeScript, Tailwind, MapLibre
Backend: FastAPI, PostgreSQL, Uvicorn, Pydantic, psycopg2

## Notes
- Map tiles require a valid MapTiler key.
- Database must be running and seeded (see `backend/database_schema.sql` and `backend/seed_data.py`).
