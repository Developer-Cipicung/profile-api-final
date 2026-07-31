# Administrators API

This document details all available endpoints for managing system Administrators.
Unlike News and Products, **there are no public endpoints** for this module. All routes are protected and strictly require the `SUPER_ADMIN` role.

---

## 1. Get All Administrators (Protected)
Fetches a paginated list of administrators.

- **Method**: `GET`
- **Endpoint**: `/api/v1/admin/administrators`
- **Authentication**: Required (`Bearer Token`)
- **Authorization**: `SUPER_ADMIN` only.

### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | int | No | Page number (default: 1). |
| `limit` | int | No | Items per page (default: 10, max 100). |
| `search` | string | No | Search by `username` or `full_name`. |
| `sort` | string | No | Options: `newest` (default), `oldest`, `username`, `full_name`. |

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": [
        {
            "id": "123e4567-e89b-12d3-a456-426614174000",
            "username": "admin",
            "full_name": "Super Administrator",
            "created_at": "2026-07-05T01:00:00.000Z",
            "updated_at": "2026-07-05T01:00:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 1,
        "totalPages": 1
    }
}
```
*(Note: `password_hash` is never exposed).*

---

## 2. Get Administrator by ID (Protected)
Fetches a single administrator's details.

- **Method**: `GET`
- **Endpoint**: `/api/v1/admin/administrators/:id`
- **Authentication**: Required (`Bearer Token`)
- **Authorization**: `SUPER_ADMIN` only.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | The administrator's UUID. |

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "username": "admin",
        "full_name": "Super Administrator",
        "created_at": "2026-07-05T01:00:00.000Z",
        "updated_at": "2026-07-05T01:00:00.000Z"
    }
}
```

---

## 3. Create Administrator (Protected)
Creates a new administrator account.

- **Method**: `POST`
- **Endpoint**: `/api/v1/admin/administrators`
- **Authentication**: Required (`Bearer Token`)
- **Authorization**: `SUPER_ADMIN` only.
- **Content-Type**: `application/json`

### Request Body
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Unique login username (max 100). |
| `password` | string | Yes | Plaintext password (min 6). |
| `full_name` | string | Yes | Display name (max 150). |

### Example Response (201 Created)
```json
{
    "success": true,
    "message": "Data created successfully",
    "data": {
        "id": "999e4567-e89b-12d3-a456-426614174999",
        "username": "newadmin",
        "full_name": "New Admin User",
        "created_at": "2026-07-05T02:00:00.000Z",
        "updated_at": "2026-07-05T02:00:00.000Z"
    }
}
```

### Error Responses
- **409 Conflict**: If the `username` already exists.

---

## 4. Delete Administrator (Protected)
Deletes an administrator account.

- **Method**: `DELETE`
- **Endpoint**: `/api/v1/admin/administrators/:id`
- **Authentication**: Required (`Bearer Token`)
- **Authorization**: `SUPER_ADMIN` only.

> [!CAUTION]
> **Last Administrator Protection:** The system strictly enforces that the last remaining administrator cannot be deleted to prevent permanent lockout. Attempting to delete the final administrator will return a `403 Forbidden` error.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | The administrator's UUID. |

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data deleted successfully"
}
```

### Error Responses
- **404 Not Found**: If the administrator ID does not exist.
- **403 Forbidden**: If the targeted ID is the last remaining administrator in the database.
