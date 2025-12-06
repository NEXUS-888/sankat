-- Global Problems Map Database Schema
-- PostgreSQL 15+

-- Drop tables if they exist (for fresh setup)
DROP TABLE IF EXISTS donations CASCADE;
DROP TABLE IF EXISTS charities CASCADE;
DROP TABLE IF EXISTS crises CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create crises table
CREATE TABLE crises (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Conflict', 'Disaster', 'Health', 'Humanitarian', 'Climate')),
    country VARCHAR(100) NOT NULL,
    latitude DECIMAL(10, 6) NOT NULL,
    longitude DECIMAL(10, 6) NOT NULL,
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')),
    summary TEXT NOT NULL,
    description TEXT NOT NULL,
    start_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create charities table
CREATE TABLE charities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    donation_url VARCHAR(500) NOT NULL,
    crisis_id INTEGER REFERENCES crises(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create donations table
CREATE TABLE donations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    crisis_id INTEGER REFERENCES crises(id) ON DELETE CASCADE NOT NULL,
    charity_id INTEGER REFERENCES charities(id) ON DELETE SET NULL,
    amount INTEGER NOT NULL,
    currency VARCHAR(10) NOT NULL,
    stripe_payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for common queries
CREATE INDEX idx_crises_category ON crises(category);
CREATE INDEX idx_crises_severity ON crises(severity);
CREATE INDEX idx_crises_country ON crises(country);
CREATE INDEX idx_crises_is_active ON crises(is_active);
CREATE INDEX idx_charities_crisis_id ON charities(crisis_id);
CREATE INDEX idx_donations_user_id ON donations(user_id);
CREATE INDEX idx_donations_crisis_id ON donations(crisis_id);
CREATE INDEX idx_donations_charity_id ON donations(charity_id);

-- Full-text search index
CREATE INDEX idx_crises_search ON crises USING GIN (
    to_tsvector('english', title || ' ' || summary || ' ' || description || ' ' || country)
);
