# Products API

This document details all available endpoints for managing UMKM Product Catalogs.
Admin endpoints require the `SUPER_ADMIN` or `MARKETING_ADMIN` role.

---

## 1. Get All Products (Public)
Fetches a paginated, sorted, and searchable list of products.

- **Method**: `GET`
- **Endpoint**: `/api/v1/products`
- **Authentication**: None required.
- **Headers**: None.
- **Body**: None.

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Pagination page number. |
| `limit` | integer | No | 12 | Items per page. |
| `search` | string | No | null | Searches the product `name` (ILIKE). |
| `sort` | string | No | `newest` | Allowed: `newest`, `oldest`, `name`, `price`. |

### Business Rules
- **Default Image**: If `image_url` is null in the database, the backend replaces it with `DEFAULT_PRODUCT_IMAGE` on the fly.

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": [
        {
            "id": "223e4567-e89b-12d3-a456-426614174001",
            "name": "Kopi Robusta",
            "description": "Kopi asli dari petani lokal",
            "price": 35000,
            "no_telp": "081234567890",
            "image_url": "/uploads/default-product.png",
            "created_at": "2026-07-05T01:00:00.000Z",
            "updated_at": "2026-07-05T01:00:00.000Z"
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 12,
        ...
    }
}
```

---

## 2. Get Product by ID (Public)
Fetches a single product's details.

- **Method**: `GET`
- **Endpoint**: `/api/v1/products/:id`
- **Authentication**: None required.

### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | uuid | Yes | The product's UUID. |

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": {
        "id": "223e4567-e89b-12d3-a456-426614174001",
        "name": "Kopi Robusta",
        "description": "Kopi asli dari petani lokal",
        "price": 35000,
        "no_telp": "081234567890",
        "image_url": "/uploads/default-product.png",
        "created_at": "2026-07-05T01:00:00.000Z",
        "updated_at": "2026-07-05T01:00:00.000Z"
    }
}
```

---

## 3. Create Product (Protected)
Creates a new product record.

- **Method**: `POST`
- **Endpoint**: `/api/v1/admin/products`
- **Authentication**: Required (Bearer Token).
- **Authorization**: `SUPER_ADMIN` or `MARKETING_ADMIN`.
- **Headers**: `Content-Type: multipart/form-data`

### Request Body (Form Data)
| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `name` | text | Yes | Max 255 chars. |
| `description` | text | Yes | Max 255 chars. |
| `price` | integer | Yes | Must be > 0. |
| `no_telp` | text | No | WhatsApp contact number, max 20 chars. |
| `image` | file | No | Max 5MB. Allowed: `jpg`, `jpeg`, `png`, `webp`. |

---

## 3. Update Product (Protected)
Updates an existing product.

- **Method**: `PUT`
- **Endpoint**: `/api/v1/admin/products/:id`
- **Authentication**: Required (Bearer Token).
- **Authorization**: `SUPER_ADMIN` or `MARKETING_ADMIN`.
- **Headers**: `Content-Type: multipart/form-data`

### Request Body (Form Data)
All fields are optional, but **at least one** must be updated.
| Field | Type | Rules |
|-------|------|-------|
| `name` | text | Max 255 chars. |
| `description` | text | Max 255 chars. |
| `price` | integer | Must be > 0. |
| `no_telp` | text | WhatsApp contact number, max 20 chars. |
| `image` | file | Max 5MB. Replaces old image. |

### Image Replacement Logic
If an image is uploaded:
1. The new image is saved to disk.
2. The database is updated.
3. The old image is safely deleted from disk.
*(If the database update fails, the newly uploaded image is rolled back and deleted to prevent orphaned files).*

---

## 4. Delete Product (Protected)
Deletes a product and its associated image.

- **Method**: `DELETE`
- **Endpoint**: `/api/v1/admin/products/:id`
- **Authentication**: Required (Bearer Token).
- **Authorization**: `SUPER_ADMIN` or `MARKETING_ADMIN`.

### Example Response (200 OK)
```json
{
    "success": true,
    "message": "Data deleted successfully"
}
```
