# QT Admin Panel Frontend

A modern React + TypeScript frontend for the QT Admin Panel, featuring cryptographic signature verification, Protobuf data handling, and real-time user analytics.

## 🚀 Features

- **🔐 Cryptographic Verification**: Client-side Ed25519 signature verification with SHA-384 hashing
- **📦 Protobuf Integration**: Runtime Protobuf decoding for efficient data transfer
- **📊 Real-time Analytics**: 7-day user registration chart with Recharts
- **✅ Verified Users Only**: Displays only cryptographically verified users
- **🎨 Modern UI**: Clean, responsive design with Tailwind-like styling
- **⚡ Performance**: React Query for efficient data fetching and caching

## 🛠 Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: TanStack Query (React Query)
- **Charts**: Recharts
- **Crypto**: @noble/ed25519 + WebCrypto API
- **Protobuf**: protobufjs (runtime loading)
- **Validation**: Zod

## 📁 Project Structure

```
src/
├── app/
│   ├── queryClient.ts          # TanStack Query client
│   └── App.tsx                 # Main app component
├── config/
│   └── env.ts                  # Environment configuration
├── crypto/
│   ├── hash.ts                 # SHA-384 hashing utilities
│   └── verify.ts               # Ed25519 signature verification
├── proto/
│   ├── loader.ts               # Protobuf runtime loader
│   └── user.proto              # User schema (shared with backend)
├── services/
│   ├── http.ts                 # HTTP client wrapper
│   ├── users.ts                # User data services
│   └── stats.ts                # Statistics services
├── features/
│   ├── users/
│   │   ├── components/
│   │   │   └── UsersTable.tsx  # Verified users table
│   │   └── hooks/
│   │       └── useVerifiedUsers.ts # React Query hook
│   └── dashboard/
│       └── components/
│           └── Users7dChart.tsx # 7-day chart component
├── pages/
│   └── Dashboard.tsx           # Main dashboard page
└── styles/
    └── index.css               # Global styles
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Backend server running on `http://localhost:4000`

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   Create `.env` file:
   ```env
   VITE_API_URL=http://localhost:4000
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open browser**:
   Navigate to `http://localhost:5173`

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 🔐 Cryptographic Features

### SHA-384 Hashing
```typescript
import { sha384 } from '@/crypto/hash';

const digest = await sha384('user@example.com');
```

### Ed25519 Signature Verification
```typescript
import { verifySignature } from '@/crypto/verify';

const isValid = await verifySignature(signature, digest, publicKey);
```

## 📦 Protobuf Integration

The frontend uses runtime Protobuf loading to decode user data:

```typescript
import { getTypes } from '@/proto/loader';

const { UserList } = await getTypes();
const decoded = UserList.decode(buffer);
```

## 📊 Data Flow

1. **Fetch Protobuf Data**: `GET /api/users/export`
2. **Decode Binary**: Runtime Protobuf decoding
3. **Verify Signatures**: Client-side Ed25519 verification
4. **Filter Valid Users**: Display only verified users
5. **Render Analytics**: Show 7-day registration chart

## 🎯 Key Requirements Met

- ✅ **Protobuf Decoding**: Runtime loading and decoding of user data
- ✅ **Crypto Verification**: Client-side Ed25519 signature verification
- ✅ **SHA-384 Hashing**: WebCrypto API implementation
- ✅ **7-Day Chart**: Recharts visualization of user statistics
- ✅ **Verified Users Only**: Filters and displays only cryptographically verified users
- ✅ **Clean Architecture**: Feature-first structure with separation of concerns

## 🔗 API Integration

The frontend integrates with the following backend endpoints:

- `GET /api/users/export` - Protobuf user data export
- `GET /api/stats/users-per-day?days=7` - 7-day user statistics
- `GET /api/health` - Health check

## 🚀 Production Build

```bash
npm run build
```

The build output will be in the `dist/` directory, ready for deployment.

## 📝 Notes

- The frontend requires the backend to be running for full functionality
- All user data is cryptographically verified before display
- The Protobuf schema is shared between frontend and backend
- Charts automatically refresh every 10 seconds
- Error handling includes graceful fallbacks for network issues

## 🤝 Contributing

1. Follow the established folder structure
2. Use TypeScript for all new code
3. Implement proper error handling
4. Add appropriate loading states
5. Test cryptographic verification thoroughly