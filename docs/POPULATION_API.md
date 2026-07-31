# Population API Documentation

The Population module allows administrators to configure a Google Spreadsheet source, crawl it on demand, and fetch summary metrics.

## Base URL
`/api/v1/admin/population`

## Authentication & Authorization
All endpoints require a valid JWT token with Admin privileges passed in the `Authorization` header (`Bearer <token>`).
Additionally, managing population data requires the `SUPER_ADMIN` or `PROFILE_ADMIN` role. (The `/summary` endpoint is accessible by any authenticated admin).

---

## 1. Get Population Summary
Fetches the aggregated summary metrics from the most recent successfully crawled snapshot.

**Endpoint**: `GET /summary`
**Responses**:
- `200 OK`: Returns summary totals (current_population, births, deaths, etc.)
- `404 Not Found`: Returned if no snapshots exist yet.

```json
// Example 200 Response
{
  "success": true,
  "data": {
    "current_population": 4500,
    "birth_total": 12,
    "death_total": 5,
    "move_in_total": 8,
    "move_out_total": 3,
    "population_increase": 20, // birth_total + move_in_total
    "population_decrease": 8, // death_total + move_out_total
    "last_imported": "2026-07-09T00:00:00Z"
  }
}
```

---

## 2. Trigger Crawler
Initiates a crawl of the specified Spreadsheet source. The source must be active. Overwrites any existing snapshot for the current/specified month/year.

**Endpoint**: `POST /crawl`
**Body**:
```json
{
  "sourceId": "uuid",
  "month": 7,  // optional, defaults to current month
  "year": 2026 // optional, defaults to current year
}
```
**Responses**:
- `200 OK`: Crawl successful, returns full snapshot summary.
- `400 Bad Request`: Validation error, parser error, concurrent crawl already running, or source is inactive.
- `404 Not Found`: Source does not exist.

```json
// Example 200 Response
{
  "success": true,
  "message": "Crawl completed successfully.",
  "data": {
    "source_id": "uuid",
    "source_name": "2026 Population Spreadsheet",
    "worksheet_name": "CIPICUNG",
    "snapshot_month": 7,
    "snapshot_year": 2026,
    "rows_processed": 45,
    "rt_count": 45,
    "rw_count": 8,
    "total_population": 4500,
    "births": 12,
    "deaths": 5,
    "move_in": 8,
    "move_out": 3,
    "imported_at": "2026-07-09T10:50:00Z"
  }
}
```

---

## 3. Manage Sources
Provides CRUD operations for population spreadsheet sources.

### List Sources
**Endpoint**: `GET /sources`
**Response**: `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "2026 Population Spreadsheet",
      "spreadsheet_url": "https://docs.google.com/spreadsheets/d/.../edit",
      "worksheet_name": "CIPICUNG",
      "is_active": true,
      "last_crawled_at": "2026-07-09T00:00:00Z",
      "last_crawl_status": "Success",
      "last_error": null,
      "created_at": "2026-07-09T00:00:00Z",
      "updated_at": "2026-07-09T00:00:00Z"
    }
  ]
}
```

### Create Source
**Endpoint**: `POST /sources`
**Body**:
```json
{
  "name": "2026 Population Spreadsheet",
  "spreadsheet_url": "https://docs.google.com/spreadsheets/d/...",
  "is_active": true
}
```
*Note: If `is_active` is true, all other sources will be automatically deactivated.*
**Response**: `201 Created`

### Update Source
**Endpoint**: `PUT /sources/:id`
**Body**:
```json
{
  "name": "Updated Name",
  "spreadsheet_url": "https://docs.google.com/spreadsheets/d/...",
  "is_active": false
}
```
**Response**: `200 OK`

### Delete Source
**Endpoint**: `DELETE /sources/:id`
**Responses**:
- `200 OK`: Source deleted successfully.
- `400 Bad Request`: Cannot delete the active source, or cannot delete a source that has historical snapshots.

### Activate Source
**Endpoint**: `POST /sources/:id/activate`
**Description**: Atomically deactivates all other sources and activates the specified source.
**Responses**:
- `200 OK`: Source activated successfully.
- `404 Not Found`: Source does not exist.

---

## Phase F4: History & Analytics

### GET `/api/v1/admin/population/history/filters`
Get all unique available combinations of year, month, and source for frontend cascading filters.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    { "year": 2026, "month": 7, "source_id": "uuid", "source": { "name": "..." } }
  ]
}
```

### GET `/api/v1/admin/population/history`
List snapshots with pagination and filtering.

**Query Parameters:**
- `month` (optional, integer)
- `year` (optional, integer)
- `sortBy` (optional, string)
- `sortOrder` (optional, "asc" | "desc")

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "month": 7,
      "year": 2026,
      "current_population": 5000,
      "birth_total": 50,
      "death_total": 20,
      "move_in_total": 10,
      "move_out_total": 5,
      "source": { "name": "Source Name" }
    }
  ],
  "count": 1
}
```

### GET `/api/v1/admin/population/history/:id`
Get snapshot details including RT/RW breakdowns.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "snapshot": { /* snapshot metadata */ },
    "details": [
      {
        "rw": "01",
        "rt": "02",
        "current_population": 150
      }
    ]
  }
}
```

### GET `/api/v1/admin/population/trends`
Get chronological snapshots for trending charts.

**Query Parameters:**
- `year` (optional, integer)
- `limit` (optional, integer)

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "month": 1,
      "year": 2026,
      "current_population": 4900,
      "birth_total": 40,
      "death_total": 15,
      "move_in_total": 5,
      "move_out_total": 5
    }
  ]
}
```

### DELETE `/api/v1/admin/population/history/:id`
Delete a snapshot. Rejects if it is the latest snapshot.

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Snapshot deleted successfully."
}
```
**Response (409 Conflict):**
```json
{
  "success": false,
  "message": "The latest snapshot cannot be deleted."
}
```
