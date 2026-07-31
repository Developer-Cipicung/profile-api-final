# API Response Formats

The backend uses a strict, uniform JSON structure for every response. This ensures the frontend can reliably parse the data.

## 1. Success Response
Used for endpoints returning a single object (e.g., `GET /news/:id` or `POST /admin/products`).

**Structure:**
- `success`: Always `true`
- `message`: Human-readable success message
- `data`: The returned object payload

**Example:**
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": {
        "id": "123e4567...",
        "title": "Welcome"
    }
}
```
*(Note: For `DELETE` endpoints, the `data` field is usually omitted.)*

## 2. Success with Pagination (List Response)
Used exclusively for `GET` list endpoints (e.g., `GET /news` and `GET /products`).

**Structure:**
- `success`: Always `true`
- `message`: Human-readable success message
- `data`: An array of objects.
- `pagination`: An object containing metadata about the current page, total pages, and available navigation.

**Example:**
```json
{
    "success": true,
    "message": "Data fetched successfully",
    "data": [
        { "id": "1", "name": "Item 1" },
        { "id": "2", "name": "Item 2" }
    ],
    "pagination": {
        "page": 1,
        "limit": 10,
        "totalItems": 45,
        "totalPages": 5,
        "hasNext": true,
        "hasPrevious": false
    }
}
```

## 3. Error Responses
Whenever the API returns a status code `>= 400`, the structure changes to indicate failure.

**Standard Error Structure:**
- `success`: Always `false`
- `message`: A brief description of what went wrong.

### Validation Error (422)
Occurs when the request body or query parameters fail the validation rules (e.g., empty title, negative price).
- `errors`: An array of objects containing the specific field that failed and the reason.

**Example:**
```json
{
    "success": false,
    "message": "Validation error",
    "errors": [
        { "price": "Price must be a positive integer" },
        { "name": "Name is required" }
    ]
}
```

### Unauthorized Error (401)
Occurs when a protected endpoint is accessed without a valid JWT token, or during a failed login attempt.
```json
{
    "success": false,
    "message": "Unauthorized: Invalid or expired token"
}
```

### Not Found Error (404)
Occurs when requesting an ID that does not exist in the database, or querying an unknown route.
```json
{
    "success": false,
    "message": "Product not found"
}
```

### Payload Too Large Error (413)
Occurs when an uploaded file exceeds the 5MB limit.
```json
{
    "success": false,
    "message": "File too large. Maximum size is 5MB"
}
```

### Internal Server Error (500)
Occurs when the server encounters an unexpected crash or database failure.
```json
{
    "success": false,
    "message": "Internal server error"
}
```
