#!/bin/bash

# Backend Setup Script for Sankat
# This script sets up the backend environment, database, and dependencies

set -e  # Exit on error

echo "🚀 Starting Sankat Backend Setup..."

# Check if we're in the backend directory
if [ ! -f "requirements.txt" ]; then
    echo "❌ Error: Please run this script from the backend/ directory"
    exit 1
fi

# 1. Create virtual environment
echo ""
echo "📦 Step 1: Creating Python virtual environment..."
if [ -d ".venv" ]; then
    echo "   ✓ Virtual environment already exists"
else
    python -m venv .venv
    echo "   ✓ Virtual environment created"
fi

# 2. Activate virtual environment
echo ""
echo "🔧 Step 2: Activating virtual environment..."
source .venv/bin/activate

# 3. Install dependencies
echo ""
echo "📥 Step 3: Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "   ✓ Dependencies installed"

# 4. Create .env file
echo ""
echo "⚙️  Step 4: Setting up environment variables..."
if [ -f ".env" ]; then
    echo "   ⚠️  .env file already exists, skipping..."
else
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "   ✓ Created .env from .env.example"
    else
        cat > .env << 'EOF'
DB_HOST=localhost
DB_PORT=5432
DB_NAME=globemap
DB_USER=postgres
DB_PASSWORD=postgres
EOF
        echo "   ✓ Created .env with default values"
    fi
    echo "   ⚠️  Please edit .env and set your database password!"
fi

# 5. Check PostgreSQL
echo ""
echo "🗄️  Step 5: Checking PostgreSQL..."
if command -v psql &> /dev/null; then
    echo "   ✓ PostgreSQL is installed"
    
    # Try to connect
    if psql -U postgres -lqt | cut -d \| -f 1 | grep -qw globemap 2>/dev/null; then
        echo "   ✓ Database 'globemap' exists"
    else
        echo "   ⚠️  Database 'globemap' does not exist"
        read -p "   Would you like to create it? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            createdb -U postgres globemap
            echo "   ✓ Database 'globemap' created"
        fi
    fi
else
    echo "   ❌ PostgreSQL is not installed or not in PATH"
    echo "   Please install PostgreSQL first"
    exit 1
fi

# 6. Initialize database schema
echo ""
echo "📋 Step 6: Initializing database schema..."
if [ -f "database_schema.sql" ]; then
    read -p "   Run database_schema.sql? This will drop existing tables. (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        psql -U postgres -d globemap -f database_schema.sql
        echo "   ✓ Database schema initialized"
    else
        echo "   ⊘ Skipped schema initialization"
    fi
else
    echo "   ⚠️  database_schema.sql not found"
fi

# 7. Seed data
echo ""
echo "🌱 Step 7: Seeding sample data..."
if [ -f "seed_data.py" ]; then
    read -p "   Run seed_data.py? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python seed_data.py
        echo "   ✓ Sample data seeded"
    else
        echo "   ⊘ Skipped data seeding"
    fi
else
    echo "   ⚠️  seed_data.py not found"
fi

# 8. Final instructions
echo ""
echo "✅ Backend setup complete!"
echo ""
echo "To start the backend server:"
echo "  1. Activate the virtual environment:"
echo "     source .venv/bin/activate"
echo ""
echo "  2. Start the server:"
echo "     uvicorn app.main:app --reload --port 8000"
echo ""
echo "  Or run:"
echo "     ./start.sh"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API Docs at: http://localhost:8000/docs"
