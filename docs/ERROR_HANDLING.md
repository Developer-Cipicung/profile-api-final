# Error Handling Guide

This document lists all standard HTTP status codes returned by the API, explaining when they occur and how the frontend should respond.

---

## 400 Bad Request
- **Meaning**: The request was malformed or violated a strict parser rule.
- **When it occurs**: Usually occurs if a user attempts to upload an invalid file extension (e.g., uploading a `.pdf` to an image-only endpoint).
- **Frontend Action**: Show an alert to the user indicating they uploaded an unsupported file type.
**Example:**
```json
{
    "success": false,
    "message": "Invalid file type. Only jpg, jpeg, png, webp are allowed"
}
```

## 401 Unauthorized
- **Meaning**: Authentication failed or is missing.
- **When it occurs**: 
  1. Failed `/auth/login` (Wrong username/password).
  2. Accessing a protected route with no token, a malformed token, or an expired token.
- **Frontend Action**: If this occurs on `/login`, show "Invalid credentials". If it occurs on a protected route, instantly clear the stored JWT and redirect the user to the login page.
**Example:**
```json
{
    "success": false,
    "message": "Unauthorized: Missing token"
}
```

## 403 Forbidden
- **Meaning**: The user is authenticated but lacks permission.
- *(Note: Currently not used in Version 1.0, as all authenticated users are super-admins).*

## 404 Not Found
- **Meaning**: The requested resource does not exist.
- **When it occurs**: 
  1. Fetching `GET /news/invalid-id`.
  2. Attempting to `PUT` or `DELETE` a record that has already been deleted.
  3. Hitting a route URL that doesn't exist.
- **Frontend Action**: Redirect the user to a generic "404 Page Not Found" screen, or show a toast message like "Item no longer exists" and refresh the list.
**Example:**
```json
{
    "success": false,
    "message": "News not found"
}
```

## 409 Conflict
- **Meaning**: The request conflicts with current state of the server.
- *(Note: Currently not used, but reserved for future constraints like unique titles).*

## 413 Payload Too Large
- **Meaning**: The request body exceeds the server's limit.
- **When it occurs**: The user attempts to upload an image larger than 5MB.
- **Frontend Action**: Immediately reject the file on the frontend before even sending the request if possible. If the server catches it, display an error indicating the file is too large.
**Example:**
```json
{
    "success": false,
    "message": "File too large. Maximum size is 5MB"
}
```

## 422 Unprocessable Entity
- **Meaning**: The request was properly formatted, but contains invalid data.
- **When it occurs**: Input fails validation (e.g., price is negative, title is empty, description exceeds 255 characters, UUID is malformed).
- **Frontend Action**: Parse the `errors` array and display inline red error messages beneath the specific form inputs that failed.
**Example:**
```json
{
    "success": false,
    "message": "Validation error",
    "errors": [
        { "price": "Price must be a positive integer" }
    ]
}
```

## 500 Internal Server Error
- **Meaning**: A fatal, unhandled exception occurred on the backend.
- **When it occurs**: Database connection drops, out of memory, or a bug in the code.
- **Frontend Action**: Show a generic fallback error like "Oops! Something went wrong on our end. Please try again later."
**Example:**
```json
{
    "success": false,
    "message": "Internal server error"
}
```
