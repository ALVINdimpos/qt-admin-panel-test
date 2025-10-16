# QT Admin Panel - Full-Stack JavaScript Developer Practical Test

## Overview

A comprehensive mini admin panel built with React + TypeScript frontend and Node.js + Express backend, featuring user management, cryptographic verification, and Protocol Buffer integration.

## Live Demo

- Frontend (Render): [Hosted Frontend](https://qt-admin-panel-test-1.onrender.com/)  
- Backend API (Render): [Hosted Backend](https://qt-admin-panel-test.onrender.com)

When hosting your own build, ensure the frontend points to the correct backend base URL via `VITE_API_URL`.

## 🚀 Features Implemented

### ✅ All Mandatory Requirements Met

1. **User Management (CRUD)**
   - Complete CRUD operations for users
   - User fields: `id`, `email`, `role`, `status`, `createdAt`
   - PostgreSQL database with Prisma ORM
   - RESTful API endpoints

2. **User Graph**
   - Interactive 7-day user creation chart
   - Built with Recharts library
   - Real-time data visualization

3. **Protocol Buffer Integration** ⭐
   - Custom `.proto` schema for User and UserList
   - `/users/export` endpoint returning protobuf-serialized data
   - Frontend protobuf decoding and verification
   - **This is the mandatory requirement - fully implemented**

4. **Cryptographic Security**
   - SHA-384 email hashing
   - Ed25519 digital signatures
   - Client-side signature verification
   - Only verified users displayed in frontend

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Framework**: Express 5 with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Crypto**: Node.js crypto module (Ed25519 + SHA-384)
- **Validation**: Zod schemas
- **Logging**: Pino structured logging
- **Security**: Helmet, CORS, rate limiting

### Frontend (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Crypto**: @noble/ed25519 + WebCrypto API
- **Protobuf**: protobufjs runtime decoding

## 📁 Project Structure

```
qt-admin-panel-test/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── users/          # User CRUD operations
│   │   │   ├── export/         # Protobuf export endpoint
│   │   │   ├── stats/          # 7-day statistics
│   │   │   └── health/         # Health check
│   │   ├── lib/
│   │   │   ├── crypto/         # Cryptographic functions
│   │   │   ├── proto/          # Protobuf schema loading
│   │   │   └── logger.ts       # Structured logging
│   │   ├── db/
│   │   │   ├── client.ts       # Prisma client
│   │   │   └── seed.ts         # Database seeding
│   │   └── shared/
│   │       └── user.proto      # Protobuf schema
│   ├── prisma/
│   │   └── schema.prisma       # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── features/
│   │   │   ├── users/          # User management components
│   │   │   └── dashboard/      # Chart components
│   │   ├── services/           # API services
│   │   ├── crypto/             # Client-side crypto
│   │   ├── proto/              # Protobuf loading
│   │   └── pages/
│   │       └── Dashboard.tsx   # Main dashboard
│   └── package.json
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp env.example .env
   ```
   
   Update `.env` with your PostgreSQL connection:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/qt_admin_panel"
   NODE_ENV=development
   PORT=4000
   ```

4. **Database Setup**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run database migrations
   npm run db:migrate
   
   # Seed the database
   npm run db:seed
   ```

5. **Start the backend server**
   ```bash
   npm run dev
   ```
   
   Server will be available at `http://localhost:4000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` (local development):
   ```env
   VITE_API_URL=http://localhost:4000
   ```

   For production builds targeting the hosted backend, set:
   ```env
   VITE_API_URL=https://qt-admin-panel-test.onrender.com
   ```

4. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   
   Frontend will be available at `http://localhost:5173`

## 🔧 API Endpoints

### User Management
- `GET /api/users` - List users (with pagination)
- `POST /api/users` - Create user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Statistics
- `GET /api/stats/users-per-day?days=7` - Get 7-day user statistics

### Export (Mandatory Requirement)
- `GET /api/users/export` - Export users in Protocol Buffer format

### Health Check
- `GET /api/health` - Health check endpoint

## 🔐 Cryptographic Implementation

### Backend (Node.js crypto)
- **Key Generation**: Ed25519 keypair generated on startup
- **Hashing**: SHA-384 for email addresses
- **Signing**: Ed25519 signature over the hash
- **Storage**: Public key in SPKI DER format, signature as raw bytes

### Frontend (WebCrypto + @noble/ed25519)
- **Hash Verification**: SHA-384 recomputation
- **Signature Verification**: Ed25519 signature verification
- **Key Parsing**: SPKI DER to raw Ed25519 public key conversion
- **Filtering**: Only verified users displayed

## 📊 Protocol Buffer Schema

```protobuf
syntax = "proto3";

package qt;

message User {
  string id = 1;
  string email = 2;
  string role = 3;
  string status = 4;
  string createdAt = 5;
  bytes emailHash = 6;
  bytes signature = 7;
  bytes publicKey = 8;
}

message UserList {
  repeated User users = 1;
}
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test                    # Run unit tests
npm run test:coverage      # Run with coverage
```

### Frontend Tests
```bash
cd frontend
npm run typecheck          # TypeScript type checking
```

## 📝 Notes & Assumptions

### Technical Decisions
1. **Database**: Chose PostgreSQL over SQLite for better production readiness
2. **Crypto Algorithm**: Used Ed25519 for better performance and security
3. **Frontend Framework**: React with Vite for fast development and building
4. **State Management**: TanStack Query for efficient data fetching and caching
5. **Styling**: Tailwind CSS for rapid UI development

### Security Considerations
- All user data is cryptographically signed
- Frontend verifies signatures before displaying users
- Rate limiting and CORS protection implemented
- Input validation with Zod schemas

### Performance Optimizations
- Database indexing on `createdAt` field
- React Query caching for API calls
- Efficient protobuf serialization/deserialization
- Optimized bundle with Vite

## 🚀 Production Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production PostgreSQL database
3. Run `npm run build` and `npm start`

### Frontend Deployment
1. Set `VITE_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy `dist/` folder to static hosting

Example for this repository's hosted demo:
- `VITE_API_URL=https://qt-admin-panel-test.onrender.com`
- Built assets hosted at `https://qt-admin-panel-test-1.onrender.com/`

## 📧 Contact

For questions about this implementation, please contact:
- **Email**: [fistonalvin@gmail.com]
- **Repository**: [https://github.com/ALVINdimpos/qt-admin-panel-test]

---