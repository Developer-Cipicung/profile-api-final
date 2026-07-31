# Authentication

The admin dashboard is protected by a stateless JSON Web Token (JWT) authentication system.

## JWT Authentication Flow
1. The frontend sends the admin credentials (`username` and `password`) to the `/api/v1/auth/login` endpoint.
2. The backend verifies the credentials using bcrypt.
3. If valid, the backend issues a signed JWT token valid for 24 hours.
4. The frontend stores this token (e.g., in LocalStorage or sessionStorage).
5. For all subsequent protected requests, the frontend attaches the token via the `Authorization` header.
6. The backend validates the token signature, expiration, and the `role` before allowing access to the protected endpoint.

## Authorization & RBAC
Protected routes require the `Authorization` header formatted as a Bearer token. 
The system uses a declarative Permission-Based architecture. Roles are mapped to permissions, and routes are protected by permissions.

### Permission Matrix

| Role | Permissions | Description |
|---|---|---|
| `SUPER_ADMIN` | `*` (All) | Full system access. Can manage administrators. |
| `PROFILE_ADMIN` | `manage_news`, `manage_population` | Can manage content (news) and population data. |
| `MARKETING_ADMIN`| `manage_products` | Can manage products only. |

**Header Example:**

**Header Example:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Token Expiration
Tokens are strictly configured to expire in **24 hours**. Once expired, the frontend must force the user to log in again. There is no refresh token mechanism in this MVP.

## Login Endpoint

**Endpoint:** `POST /api/v1/auth/login`
**Content-Type:** `application/json` or `application/x-www-form-urlencoded`

**Example Request:**
```json
{
    "username": "admin",
    "password": "admin123"
}
```

**Example Response (200 OK):**
```json
{
    "success": true,
    "message": "Login successful",
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5c...",
        "admin": {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "username": "admin",
            "full_name": "Administrator",
            "role": "SUPER_ADMIN"
        }
    }
}
```

## Frontend Login Flow
1. User submits login form.
2. Frontend calls `POST /api/v1/auth/login`.
3. If successful, frontend saves the `accessToken` and redirects to the dashboard.
4. If unsuccessful, frontend displays the generic "Invalid username or password" message.

## Frontend Logout Flow
Since JWT is stateless, logout is handled entirely on the frontend by simply deleting the token from storage and redirecting the user to the login page.

## Handling Unauthorized Responses
If a token is missing, malformed, or expired, the backend returns a `401 Unauthorized` status.
**Example Response:**
```json
{
    "success": false,
    "message": "Unauthorized: Invalid or expired token"
}
```
**Frontend Action**: The frontend should globally intercept `401` responses, delete the stored token, and redirect the user back to the login screen.

## Authentication Sequence Diagram

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as Database

    F->>B: POST /auth/login (username, password)
    B->>DB: Fetch Admin by username
    DB-->>B: Admin Record (Password Hash)
    B->>B: bcrypt.compare()
    alt Invalid Credentials
        B-->>F: 401 Unauthorized
    else Valid Credentials
        B->>B: Sign JWT Token
        B-->>F: 200 OK + JWT Token
    end

    F->>F: Store Token
    
    F->>B: POST /admin/news (Header: Bearer Token)
    B->>B: Verify Token Signature & Expiry
    alt Invalid/Expired Token
        B-->>F: 401 Unauthorized
    else Valid Token
        B->>DB: Execute Admin Action
        DB-->>B: Action Success
        B-->>F: 200 OK / 201 Created
    end
```
