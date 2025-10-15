# QT Admin Panel API Documentation

## Overview

The QT Admin Panel API is a production-ready Node.js backend service that provides comprehensive user management with advanced features including cryptographic operations, Protobuf export, and statistical analytics.

**Base URL**: `http://localhost:4000`  
**API Version**: `1.0.0`  
**Environment**: Development/Production

---

## Table of Contents

- [Authentication](#authentication)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [User Management](#user-management)
  - [User Export](#user-export)
  - [Statistics](#statistics)
- [Data Models](#data-models)
- [Examples](#examples)

---

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

---

## Error Handling

The API uses consistent error response format:

```json
{
  "success": false,
  "error": "Error message",
  "details": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ],
  "requestId": "req_1760560574287_zp1ic02on"
}
```

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (Validation Error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit information is included in response headers

---

## Endpoints

### Health Check

#### GET /api/health

Check the health status of the API server.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-10-15T20:35:39.119Z",
  "uptime": 2,
  "version": "1.0.0",
  "environment": "development",
  "memory": {
    "rss": 88,
    "heapTotal": 31,
    "heapUsed": 12,
    "external": 2
  }
}
```

---

## User Management

### Create User

#### POST /api/users

Create a new user with cryptographic artifacts (SHA-384 hash and Ed25519 signature).

**Request Body:**
```json
{
  "email": "user@example.com",
  "role": "user",
  "status": "active"
}
```

**Validation Rules:**
- `email`: Valid email format, unique
- `role`: Must be `"admin"` or `"user"`
- `status`: Must be `"active"` or `"inactive"`

**Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "cmgsgia9k0000ibzfpqgifzdd",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2025-10-15T20:41:47.383Z",
    "emailHash": "OnZNyYJFuwQ47la9qDvv8zIDLdC1ohTPBs6oL5KpHClbvmgeiANvBPSAP/9ELjGY",
    "signature": "QqiuhTuxVhzqLzSvbqJ31kwlUo0IlncnyPALwePNBlPu2UD3/c19gVnr4ZrFBR4bVKdWSusOxm7skdNmcCdTBg==",
    "publicKey": "MCowBQYDK2VwAyEATqBMvLpfcSSmTPFKfwTVDPpnlyD9WWCK6cf34s/R1qI="
  }
}
```

### Get All Users

#### GET /api/users

Retrieve a paginated list of all users.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)

**Example:** `GET /api/users?page=1&limit=10`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "cmgsgia9k0000ibzfpqgifzdd",
      "email": "user@example.com",
      "role": "user",
      "status": "active",
      "createdAt": "2025-10-15T20:41:47.383Z",
      "emailHash": "OnZNyYJFuwQ47la9qDvv8zIDLdC1ohTPBs6oL5KpHClbvmgeiANvBPSAP/9ELjGY",
      "signature": "QqiuhTuxVhzqLzSvbqJ31kwlUo0IlncnyPALwePNBlPu2UD3/c19gVnr4ZrFBR4bVKdWSusOxm7skdNmcCdTBg==",
      "publicKey": "MCowBQYDK2VwAyEATqBMvLpfcSSmTPFKfwTVDPpnlyD9WWCK6cf34s/R1qI="
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 19,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### Get User by ID

#### GET /api/users/{id}

Retrieve a specific user by their unique ID.

**Path Parameters:**
- `id`: User's unique identifier (cuid format)

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmgsgia9k0000ibzfpqgifzdd",
    "email": "user@example.com",
    "role": "user",
    "status": "active",
    "createdAt": "2025-10-15T20:41:47.383Z",
    "emailHash": "OnZNyYJFuwQ47la9qDvv8zIDLdC1ohTPBs6oL5KpHClbvmgeiANvBPSAP/9ELjGY",
    "signature": "QqiuhTuxVhzqLzSvbqJ31kwlUo0IlncnyPALwePNBlPu2UD3/c19gVnr4ZrFBR4bVKdWSusOxm7skdNmcCdTBg==",
    "publicKey": "MCowBQYDK2VwAyEATqBMvLpfcSSmTPFKfwTVDPpnlyD9WWCK6cf34s/R1qI="
  }
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found",
  "requestId": "req_1760560574287_zp1ic02on"
}
```

### Update User

#### PUT /api/users/{id}

Update an existing user's role and/or status.

**Path Parameters:**
- `id`: User's unique identifier

**Request Body:**
```json
{
  "role": "admin",
  "status": "inactive"
}
```

**Validation Rules:**
- `role`: Must be `"admin"` or `"user"`
- `status`: Must be `"active"` or `"inactive"`
- At least one field must be provided

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "cmgsgia9k0000ibzfpqgifzdd",
    "email": "user@example.com",
    "role": "admin",
    "status": "inactive",
    "createdAt": "2025-10-15T20:41:47.383Z",
    "emailHash": "OnZNyYJFuwQ47la9qDvv8zIDLdC1ohTPBs6oL5KpHClbvmgeiANvBPSAP/9ELjGY",
    "signature": "QqiuhTuxVhzqLzSvbqJ31kwlUo0IlncnyPALwePNBlPu2UD3/c19gVnr4ZrFBR4bVKdWSusOxm7skdNmcCdTBg==",
    "publicKey": "MCowBQYDK2VwAyEATqBMvLpfcSSmTPFKfwTVDPpnlyD9WWCK6cf34s/R1qI="
  }
}
```

### Delete User

#### DELETE /api/users/{id}

Delete a user from the system.

**Path Parameters:**
- `id`: User's unique identifier

**Response (200 OK):**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Error Response (404 Not Found):**
```json
{
  "success": false,
  "error": "User not found",
  "requestId": "req_1760560574287_zp1ic02on"
}
```

---

## User Export

### Export Users as Protobuf

#### GET /api/users/export

Export all users in Protobuf binary format for external systems.

**Response Headers:**
- `Content-Type`: `application/x-protobuf`
- `Content-Disposition`: `attachment; filename="users.pb"`
- `Content-Length`: Buffer size in bytes

**Response (200 OK):**
Binary Protobuf data containing all users with their cryptographic artifacts.

**Protobuf Schema:**
```protobuf
syntax = "proto3";

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

---

## Statistics

### User Statistics

#### GET /api/stats/users-per-day

Get user registration statistics for the specified number of days.

**Query Parameters:**
- `days` (required): Number of days to analyze (minimum: 1, maximum: 365)

**Example:** `GET /api/stats/users-per-day?days=7`

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "date": "2025-10-09",
      "count": 0
    },
    {
      "date": "2025-10-10",
      "count": 0
    },
    {
      "date": "2025-10-11",
      "count": 0
    },
    {
      "date": "2025-10-12",
      "count": 0
    },
    {
      "date": "2025-10-13",
      "count": 0
    },
    {
      "date": "2025-10-14",
      "count": 0
    },
    {
      "date": "2025-10-15",
      "count": 19
    }
  ],
  "meta": {
    "days": 7,
    "totalUsers": 19,
    "period": {
      "startDate": "2025-10-09",
      "endDate": "2025-10-15"
    }
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "days",
      "message": "Too small: expected number to be >=1"
    }
  ],
  "requestId": "req_1760560574287_zp1ic02on"
}
```

---

## Data Models

### User

| Field | Type | Description | Constraints |
|-------|------|-------------|-------------|
| `id` | string | Unique identifier | cuid format |
| `email` | string | User's email address | Valid email, unique |
| `role` | string | User role | `"admin"` or `"user"` |
| `status` | string | User status | `"active"` or `"inactive"` |
| `createdAt` | string | Creation timestamp | ISO 8601 format |
| `emailHash` | string | SHA-384 hash of email | Base64 encoded |
| `signature` | string | Ed25519 signature | Base64 encoded |
| `publicKey` | string | Ed25519 public key | Base64 encoded |

### Pagination

| Field | Type | Description |
|-------|------|-------------|
| `page` | number | Current page number |
| `limit` | number | Items per page |
| `total` | number | Total number of items |
| `totalPages` | number | Total number of pages |
| `hasNext` | boolean | Whether next page exists |
| `hasPrev` | boolean | Whether previous page exists |

---

## Examples

### Complete CRUD Workflow

1. **Create User**
   ```bash
   curl -X POST http://localhost:4000/api/users \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","role":"user","status":"active"}'
   ```

2. **Get All Users**
   ```bash
   curl http://localhost:4000/api/users
   ```

3. **Get Single User**
   ```bash
   curl http://localhost:4000/api/users/{user_id}
   ```

4. **Update User**
   ```bash
   curl -X PUT http://localhost:4000/api/users/{user_id} \
     -H "Content-Type: application/json" \
     -d '{"role":"admin","status":"inactive"}'
   ```

5. **Delete User**
   ```bash
   curl -X DELETE http://localhost:4000/api/users/{user_id}
   ```

### Export and Statistics

1. **Export Users**
   ```bash
   curl http://localhost:4000/api/users/export -o users.pb
   ```

2. **Get Statistics**
   ```bash
   curl "http://localhost:4000/api/stats/users-per-day?days=7"
   ```

---

## Cryptographic Features

### SHA-384 Hashing
- All user emails are hashed using SHA-384 algorithm
- Hash is stored as Base64-encoded string
- Used for data integrity verification

### Ed25519 Digital Signatures
- Each user record includes a digital signature
- Signature is generated using Ed25519 algorithm
- Public key is stored for signature verification
- Ensures data authenticity and non-repudiation

### Protobuf Export
- Users can be exported in binary Protobuf format
- Includes all cryptographic artifacts
- Suitable for integration with external systems
- Maintains data integrity during transfer

---

## Error Codes Reference

| Code | Description | Common Causes |
|------|-------------|---------------|
| `400` | Bad Request | Invalid request body, validation errors |
| `404` | Not Found | User ID not found, invalid endpoint |
| `500` | Internal Server Error | Database connection issues, server errors |

---

## Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP address
- **Headers**: Rate limit information included in response headers
- **Exceeded**: Returns `429 Too Many Requests` status

---

## Support

For API support and questions, please refer to the project documentation or contact the development team.

**API Version**: 1.0.0  
**Last Updated**: 2025-10-15  
**Documentation Version**: 1.0
