# PostgreSQL Setup Guide

This guide will help you set up PostgreSQL for the QT Admin Panel Backend.

## 🐘 PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install PostgreSQL
brew install postgresql

# Start PostgreSQL service
brew services start postgresql

# Create a user (optional)
createuser -s postgres
```

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Windows
1. Download PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user

## 🗄️ Database Setup

### 1. Connect to PostgreSQL
```bash
# Connect as postgres user
psql -U postgres

# Or if you have a specific user
psql -U your_username -h localhost
```

### 2. Create Databases
```sql
-- Create main database
CREATE DATABASE qt_admin_db;

-- Create test database (optional)
CREATE DATABASE qt_admin_test_db;

-- List databases to verify
\l

-- Exit psql
\q
```

### 3. Create Application User (Recommended)
```sql
-- Connect as postgres
psql -U postgres

-- Create application user
CREATE USER qt_admin_user WITH PASSWORD 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE qt_admin_db TO qt_admin_user;
GRANT ALL PRIVILEGES ON DATABASE qt_admin_test_db TO qt_admin_user;

-- Exit
\q
```

## ⚙️ Environment Configuration

Update your `.env` file with the correct PostgreSQL connection string:

```env
# Using postgres user
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/qt_admin_db?schema=public"

# Using application user
DATABASE_URL="postgresql://qt_admin_user:your_secure_password@localhost:5432/qt_admin_db?schema=public"

# For testing
TEST_DATABASE_URL="postgresql://qt_admin_user:your_secure_password@localhost:5432/qt_admin_test_db?schema=public"
```

## 🔧 Connection String Format

```
postgresql://username:password@host:port/database?schema=schema_name
```

**Components:**
- `username`: PostgreSQL username
- `password`: User password
- `host`: Database host (usually `localhost`)
- `port`: PostgreSQL port (default: `5432`)
- `database`: Database name
- `schema`: Schema name (usually `public`)

## 🚀 Quick Setup Commands

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npm run db:generate

# 3. Run migrations
npm run db:migrate

# 4. Seed database
npm run db:seed

# 5. Start development server
npm run dev
```

## 🔍 Troubleshooting

### Connection Issues
```bash
# Test connection
psql -U postgres -h localhost -d qt_admin_db

# Check if PostgreSQL is running
# macOS
brew services list | grep postgresql

# Ubuntu
sudo systemctl status postgresql
```

### Permission Issues
```sql
-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE qt_admin_db TO your_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_user;
```

### Reset Database
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS qt_admin_db;"
psql -U postgres -c "CREATE DATABASE qt_admin_db;"

# Run migrations again
npm run db:migrate
```

## 📊 Database Management

### Using Prisma Studio
```bash
# Open Prisma Studio
npm run db:studio
```

### Manual Database Access
```bash
# Connect to database
psql -U postgres -d qt_admin_db

# List tables
\dt

# Describe table structure
\d users

# Exit
\q
```

## 🔒 Security Best Practices

1. **Use Application User**: Don't use `postgres` user in production
2. **Strong Passwords**: Use complex passwords for database users
3. **Network Security**: Restrict database access to application servers
4. **SSL Connections**: Use SSL in production environments
5. **Regular Backups**: Set up automated database backups

## 🌐 Production Considerations

### Connection Pooling
For production, consider using connection pooling:

```env
# With connection pooling
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public&connection_limit=20&pool_timeout=20"
```

### SSL Configuration
```env
# With SSL
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public&sslmode=require"
```

### Environment-Specific URLs
```env
# Development
DATABASE_URL="postgresql://user:pass@localhost:5432/qt_admin_dev"

# Staging
DATABASE_URL="postgresql://user:pass@staging-db:5432/qt_admin_staging"

# Production
DATABASE_URL="postgresql://user:pass@prod-db:5432/qt_admin_prod"
```

---

**Need Help?** Check the main README.md for additional setup instructions or open an issue for support.
