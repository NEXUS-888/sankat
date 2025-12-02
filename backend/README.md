# Global Problems Map - Backend

FastAPI backend for the Global Problems Map application.

## Prerequisites

- Python 3.11+
- PostgreSQL 15+

## Setup

### 1. Create a virtual environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure environment

Copy the example environment file and update with your database credentials:

```bash
cp .env.example .env
# Edit .env with your database credentials
```

### 4. Set up the database

Create the database and run the schema:

```bash
# Create database
createdb globemap

# Run schema (from backend directory)
psql -d globemap -f database_schema.sql
```

### 5. Seed the database

```bash
python seed_data.py
```

### 6. Run the server

```bash
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/crises/` | List crises (supports `q`, `category`, `severity` params) |
| GET | `/crises/{id}` | Get crisis details |
| GET | `/charities/` | List charities (supports `crisis_id` param) |
| GET | `/charities/by-crisis/{id}` | Get charities for a crisis |
