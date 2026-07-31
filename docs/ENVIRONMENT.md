# Environment Variables

The backend relies on the `.env` file for configuration. Below is a detailed explanation of every environment variable required for the application to run successfully.

| Variable | Required | Example Value | Purpose & Notes |
|----------|----------|---------------|-----------------|
| `PORT` | No | `3000` | The port the Express server listens on. Defaults to 3000 if omitted. |
| `DATABASE_URL` | Yes | `postgresql://postgres:pass@localhost:5432/desa_cipicung` | The connection string for PostgreSQL. Format: `postgresql://[user]:[password]@[host]:[port]/[db_name]`. |
| `JWT_SECRET` | Yes | `your_super_secret_key` | Used to cryptographically sign and verify the JSON Web Tokens. If changed, all currently logged-in users will be instantly logged out. |
| `DEFAULT_NEWS_IMAGE` | Yes | `/uploads/default-news.png` | The static URL path returned by the API if a News article does not have a custom uploaded thumbnail. |
| `DEFAULT_PRODUCT_IMAGE`| Yes | `/uploads/default-product.png` | The static URL path returned by the API if a Product does not have a custom uploaded image. |
| `UPLOAD_DIRECTORY` | Yes | `uploads` | The base folder where all user-uploaded files will be stored. |
| `TZ` | Yes | `Asia/Jakarta` | Enforces the timezone for Node.js to ensure all database timestamps align with UTC+7. |
