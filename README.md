# Global Problems Map - Sankat

Track and support global crises with real-time crisis mapping and charity connections.

## Project Overview

This application provides an interactive map to visualize global crises and connect users with relevant charitable organizations. It combines real-time data visualization with actionable ways to help.

## Getting Started

**Local Development**

Clone the repository and start developing:

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to the project directory
cd sankat

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your MapTiler API key to .env

# Start the frontend development server
npm run dev

# In a separate terminal, set up the backend
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Set up the database
cp .env.example .env
# Configure your database credentials in backend/.env
# Initialize PostgreSQL and run the schema
psql -U postgres -d globemap -f database_schema.sql
python seed_data.py

# Start the backend server
uvicorn app.main:app --reload
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

### Frontend
- **Vite** - Build tool and dev server
- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI component library
- **MapLibre GL** - Interactive maps
- **TanStack Query** - Data fetching and caching

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - Database
- **Uvicorn** - ASGI server
- **Pydantic** - Data validation
- **psycopg2** - PostgreSQL adapter

## Features

- 🗺️ Interactive global crisis map with real-time visualization
- 📊 Crisis filtering by category and severity
- 🎯 Detailed crisis information panels
- 💰 Direct links to charitable organizations
- 🔍 Search functionality
- 📱 Responsive design

## Environment Variables

### Frontend (.env)
```
VITE_MAPTILER_KEY=your_maptiler_api_key
```

### Backend (backend/.env)
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globemap
DB_USER=postgres
DB_PASSWORD=your_password
```

## API Endpoints

- `GET /health` - Health check
- `GET /crises/` - List all crises (with optional filters)
- `GET /crises/{id}` - Get specific crisis
- `GET /charities/` - List charities (optionally filtered by crisis)
- API Documentation: `http://localhost:8000/docs`

## Contributing

Feel free to submit issues and pull requests!
