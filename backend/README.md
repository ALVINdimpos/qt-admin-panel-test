# QT Admin Panel Backend

A production-ready Node.js backend API for the QT Mini Admin Panel, featuring CRUD operations, cryptographic signatures, and Protobuf export functionality.

## 🚀 Features

- **CRUD Operations**: Full user management with create, read, update, delete
- **Cryptographic Security**: SHA-384 email hashing with Ed25519 digital signatures
- **Protobuf Export**: Binary export format for efficient data transfer
- **7-Day Statistics**: User registration analytics with daily aggregation
- **Production Ready**: Comprehensive error handling, logging, and security
- **Type Safety**: Full TypeScript implementation with Zod validation
- **Testing**: Unit and E2E test coverage

## 🛠 Tech Stack

- **Runtime**: Node.js 20 LTS
- **Framework**: Express 5
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod schemas
- **Logging**: Pino (JSON structured logging)
- **Security**: Helmet, CORS, rate limiting
- **Crypto**: Node.js built-in crypto (Ed25519, SHA-384)
- **Protobuf**: protobufjs
- **Testing**: Vitest + Supertest
- **TypeScript**: Full type safety

## 📋 Prerequisites

- Node.js 20+ LTS
- npm or pnpm
- PostgreSQL 12+ (with psql command available)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Copy the environment example and configure:

```bash
cp env.example .env
```

Edit `.env` with your PostgreSQL configuration:

```env
PORT=4000
DATABASE_URL="postgresql://username:password@localhost:5432/qt_admin_db?schema=public"
NODE_ENV=development
```

**Note**: Replace `username`, `password`, and `qt_admin_db` with your actual PostgreSQL credentials and database name.

### 3. Database Setup

**Create PostgreSQL Database:**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE qt_admin_db;

# Create test database (optional)
CREATE DATABASE qt_admin_test_db;

# Exit psql
\q
```

**Generate Prisma client and run migrations:**
```bash
npm run db:generate
npm run db:migrate
```

### 4. Seed Database (Optional)

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

The API will be available at `http://localhost:4000`

## 📚 API Documentation

### Base URL
```
http://localhost:4000/api
```

### Endpoints

#### Health Check
```http
GET /api/health
```

#### Users CRUD

**Create User**
```http
POST /api/users
Content-Type: application/json

{
  "email": "user@example.com",
  "role": "user",
  "status": "active"
}
```

**Get Users (with pagination)**
```http
GET /api/users?page=1&limit=20&role=user&status=active&search=example
```

**Get User by ID**
```http
GET /api/users/:id
```

**Update User**
```http
PUT /api/users/:id
Content-Type: application/json

{
  "role": "admin",
  "status": "inactive"
}
```

**Delete User**
```http
DELETE /api/users/:id
```

#### Users Export (Protobuf)
```http
GET /api/users/export
```

Returns binary Protobuf data with `Content-Type: application/x-protobuf`

#### Statistics
```http
GET /api/stats/users-per-day?days=7
```

Returns user registration statistics for the last N days.

### Response Format

All JSON responses follow this structure:

```json
{
  "success": true,
  "data": { ... },
  "pagination": { ... }, // for list endpoints
  "meta": { ... } // for stats endpoints
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ], // for validation errors
  "requestId": "req_1234567890_abc123"
}
```

## 🔐 Cryptographic Features

### Email Hashing
- **Algorithm**: SHA-384
- **Input**: Email address (UTF-8)
- **Output**: 48-byte digest

### Digital Signatures
- **Algorithm**: Ed25519
- **Key Generation**: Automatic on server startup
- **Signing**: SHA-384(email) → Ed25519 signature
- **Verification**: Frontend can verify signatures using stored public key

### Frontend Verification Process

```javascript
// 1. Recompute email hash
const emailHash = crypto.subtle.digest('SHA-384', new TextEncoder().encode(email));

// 2. Verify signature
const isValid = await crypto.subtle.verify(
  'Ed25519',
  publicKey, // from user record
  signature, // from user record
  emailHash
);

// 3. Only show user if signature is valid
if (isValid) {
  // Display user
}
```

## 📦 Protobuf Schema

The shared Protobuf schema (`src/shared/user.proto`):

```protobuf
syntax = "proto3";
package qt;

message User {
  string id = 1;
  string email = 2;
  string role = 3;
  string status = 4;
  string createdAt = 5;  // ISO string
  bytes  emailHash = 6;  // SHA-384 digest bytes
  bytes  signature = 7;  // signature over digest
  bytes  publicKey = 8;  // Ed25519 public key
}

message UserList {
  repeated User users = 1;
}
```

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Test Categories
- **Unit Tests**: Crypto utilities, service logic, DTO validation
- **E2E Tests**: Full API integration tests

## 🛠 Development Scripts

```bash
# Development
npm run dev              # Start development server with hot reload
npm run build           # Build for production
npm start              # Start production server

# Database
npm run db:migrate     # Run database migrations
npm run db:studio      # Open Prisma Studio
npm run db:generate    # Generate Prisma client
npm run db:seed        # Seed database with sample data

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues
npm run format         # Format code with Prettier

# Testing
npm test              # Run tests
npm run test:coverage # Run tests with coverage
```

## 🏗 Architecture

### Project Structure
```
src/
├── app/                 # Express application setup
│   ├── middlewares/     # Global middlewares
│   ├── errors/          # Error handling
│   ├── routes.ts        # Route mounting
│   └── server.ts        # Server creation
├── config/              # Configuration management
├── db/                  # Database setup
│   ├── prisma/          # Prisma schema
│   ├── client.ts        # Prisma client
│   └── seed.ts          # Database seeding
├── lib/                 # Shared utilities
│   ├── crypto/          # Cryptographic operations
│   ├── proto/           # Protobuf utilities
│   ├── http.ts          # HTTP helpers
│   ├── time.ts          # Date utilities
│   └── logger.ts        # Logging setup
├── modules/             # Feature modules
│   ├── health/          # Health check
│   ├── users/           # User CRUD
│   ├── export/          # Protobuf export
│   └── stats/           # Statistics
├── shared/              # Shared schemas
│   └── user.proto       # Protobuf schema
└── test/                # Test files
```

### Design Principles

- **Layered Architecture**: Controller → Service → Repository
- **Dependency Injection**: Services receive repositories as dependencies
- **Pure DTOs**: Strict input/output validation with Zod
- **Error Handling**: Centralized error handling with custom error classes
- **Logging**: Structured JSON logging with request correlation
- **Security**: Helmet, CORS, rate limiting, input validation

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `4000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://username:password@localhost:5432/qt_admin_db?schema=public` |
| `NODE_ENV` | Environment mode | `development` |
| `TEST_DATABASE_URL` | Test database connection string | `postgresql://username:password@localhost:5432/qt_admin_test_db?schema=public` |

### Security Configuration

- **Helmet**: Security headers
- **CORS**: Configurable origins
- **Rate Limiting**: 120 requests/minute per IP
- **Input Validation**: Zod schemas for all inputs
- **Body Size Limit**: 1MB maximum

## 📊 Monitoring & Logging

### Structured Logging
All logs are in JSON format with:
- Request correlation IDs
- Timestamps
- Log levels
- Structured data

### Health Check
The `/api/health` endpoint provides:
- Server status
- Uptime
- Memory usage
- Version information

## 🚀 Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Docker (Optional)
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["npm", "start"]
```

### Environment Setup
- Set `NODE_ENV=production`
- Configure proper CORS origins
- Set up proper logging aggregation
- Configure database backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the API documentation
2. Review the test files for usage examples
3. Check the logs for error details
4. Open an issue with detailed information

---

**Built with ❤️ for the QT Admin Panel**
