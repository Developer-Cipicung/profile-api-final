# File Upload Guidelines

The API handles file uploads for News thumbnails and Product images. 

## Content Type
When a frontend application makes a request to upload an image (e.g., creating or updating News/Products), the HTTP request MUST use:
`Content-Type: multipart/form-data`

*Note: For endpoints that do not involve files (like Login), standard `application/json` is used.*

## Constraints
To protect the server, strict constraints are enforced on uploaded files:
- **Maximum File Size**: 5 MB (Megabytes).
- **Allowed Extensions**: `.jpg`, `.jpeg`, `.png`, `.webp`.
- **MIME Types**: Images are strictly validated via MIME types (e.g., `image/jpeg`). Spoofing the extension of a text file will be rejected.

## Upload Directories
Uploaded images are statically served by Express and stored locally:
- News Thumbnails: `/uploads/news/`
- Product Images: `/uploads/products/`

## Default Image Behavior
If a user creates a News or Product without attaching an image, the backend stores `NULL` in the database for the image URL.
However, when the frontend queries the `GET` endpoints, the backend's Service layer intercepts the `NULL` value and replaces it with a default placeholder image path defined in `.env`:
- `DEFAULT_NEWS_IMAGE`
- `DEFAULT_PRODUCT_IMAGE`

> [!NOTE]
> The backend never physically saves a copy of the default image per record. It just points the URL to the shared placeholder.

## Replacing Images (PUT Requests)
When an admin updates a record and provides a new file:
1. The backend saves the new file.
2. Updates the database record to point to the new file.
3. Automatically deletes the old physical file from the disk to save space.

## Deleting Images (DELETE Requests)
When an admin deletes a record, the backend automatically finds the associated physical image on disk and unlinks (deletes) it. It explicitly ignores and preserves the default placeholder images.

## Common Frontend Mistakes
- **Forgetting `multipart/form-data`**: Fetch API and Axios require specific setups to send `FormData` objects. If you send JSON, the file will be ignored and validation errors may occur.
- **Empty file inputs**: Sending an empty string for the file field instead of omitting the field entirely can cause validation failures.
- **File size limits**: Attempting to upload a 6MB file will result in a `413 Payload Too Large` error, which the frontend must gracefully handle and explain to the user.

## Example Frontend Upload (Fetch API)
```javascript
const formData = new FormData();
formData.append('title', 'Berita Baru');
formData.append('content', 'Isi teks berita');
// fileInput is an HTML <input type="file" />
if (fileInput.files[0]) {
    formData.append('thumbnail', fileInput.files[0]);
}

fetch('http://localhost:3000/api/v1/admin/news', {
    method: 'POST',
    headers: {
        'Authorization': `Bearer ${token}`
        // Do NOT set Content-Type manually when using FormData.
        // The browser sets it automatically with the correct boundary.
    },
    body: formData
});
```
