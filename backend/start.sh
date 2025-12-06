#!/bin/bash

# Backend Start Script for Sankat
# Starts the FastAPI backend server

set -e

echo "🚀 Starting Sankat Backend Server..."

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend/ directory"
    exit 1
fi

# Check if virtual environment exists
if [ ! -d ".venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup.sh first"
    exit 1
fi

# Activate virtual environment
source .venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found. Using default environment variables."
fi

# Start the server
echo "✓ Starting FastAPI server on http://localhost:8000"
echo "✓ API Docs available at http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload --port 8000
