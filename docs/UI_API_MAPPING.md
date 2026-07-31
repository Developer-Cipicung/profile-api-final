# UI to API Mapping

This document provides a direct mapping between the expected frontend UI pages and the backend API endpoints.

## Public Website

| Frontend Page | Component | API Endpoint | Method | Auth Required? | Purpose |
|---------------|-----------|--------------|--------|----------------|---------|
| **Home / News** | News List | `/api/v1/news` | GET | No | Display a paginated, searchable list of village news. |
| **News Detail** | Article View | `/api/v1/news/:id` | GET | No | Fetch the full content of a specific news article. |
| **UMKM Catalog**| Product List | `/api/v1/products` | GET | No | Display a paginated, searchable grid of products. |

### UI State Behaviors (Public)
- **Loading State**: Display skeleton loaders while data is fetching.
- **Empty State**: If `data` is an empty array (e.g., search returns no results), display "Tidak ada data ditemukan".
- **Error State**: If the server is unreachable, display a friendly fallback UI.

---

## Admin Dashboard

| Frontend Page | Component | API Endpoint | Method | Auth Required? | Purpose |
|---------------|-----------|--------------|--------|----------------|---------|
| **Login** | Auth Form | `/api/v1/auth/login` | POST | No | Authenticate admin and retrieve JWT. |
| **Dashboard** | News Table | `/api/v1/news` | GET | No | List news articles for admin management. |
| **Dashboard** | Create News Modal | `/api/v1/admin/news` | POST | **Yes** | Publish a new article (supports image upload). |
| **Dashboard** | Edit News Modal | `/api/v1/admin/news/:id` | PUT | **Yes** | Update an existing article. |
| **Dashboard** | Delete News Btn | `/api/v1/admin/news/:id` | DELETE | **Yes** | Remove an article and its image. |
| **Dashboard** | Product Table | `/api/v1/products` | GET | No | List products for admin management. |
| **Dashboard** | Create Product Modal | `/api/v1/admin/products` | POST | **Yes** | Add a new product (supports image upload). |
| **Dashboard** | Edit Product Modal | `/api/v1/admin/products/:id` | PUT | **Yes** | Update product details. |
| **Dashboard** | Delete Product Btn | `/api/v1/admin/products/:id` | DELETE | **Yes** | Remove a product and its image. |

### UI State Behaviors (Admin)
- **Validation State (422)**: Read the `errors` array from the response and highlight invalid inputs in red.
- **Success State**: Close the Create/Edit modal, display a green success toast, and automatically refresh the Table component.
- **Loading State**: Disable the "Save" button and show a spinner to prevent duplicate submissions.
- **Unauthorized (401)**: If any protected request returns 401, globally intercept it and redirect the user back to the Login page.
