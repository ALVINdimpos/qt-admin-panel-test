#!/bin/bash

# PostgreSQL Database Setup Script for QT Admin Panel

echo "🐘 Setting up PostgreSQL database for QT Admin Panel..."

# Check if PostgreSQL is running
if ! pg_isready -q; then
    echo "❌ PostgreSQL is not running. Please start PostgreSQL first:"
    echo "   macOS: brew services start postgresql"
    echo "   Ubuntu: sudo systemctl start postgresql"
    echo "   Or start it manually"
    exit 1
fi

echo "✅ PostgreSQL is running"

# Create databases
echo "📋 Creating databases..."

# Create main database
psql -U postgres -c "CREATE DATABASE qt_admin_db;" 2>/dev/null || echo "Database qt_admin_db already exists"

# Create test database
psql -U postgres -c "CREATE DATABASE qt_admin_test_db;" 2>/dev/null || echo "Database qt_admin_test_db already exists"

echo "✅ Databases created successfully"

# Test connection
echo "🔍 Testing database connection..."
if psql -U postgres -d qt_admin_db -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your PostgreSQL credentials and ensure the user has proper permissions"
    exit 1
fi

echo ""
echo "🎉 PostgreSQL setup complete!"
echo ""
echo "Next steps:"
echo "1. Run migrations: npm run db:migrate"
echo "2. Seed database: npm run db:seed"
echo "3. Start server: npm run dev"
echo ""
echo "Database connection string:"
echo "postgresql://postgres:password@localhost:5432/qt_admin_db?schema=public"
