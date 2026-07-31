# Website Profil Desa Cipicung API Documentation

## Project Overview
This repository contains the backend API for the official Village Profile Website of Desa Cipicung. 

## Purpose of the Backend
The backend serves as the core data provider for both the public-facing village profile website and the secure administrative dashboard. It manages news articles, UMKM product catalogs, and administrative authentication.

## Technology Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL (No ORM, pure parameterized SQL queries)
- **Authentication**: JWT (JSON Web Tokens) with bcrypt password hashing
- **File Upload**: Multer (Local storage)
- **Validation**: express-validator

## Project Structure Overview
```text
src/
├── config/       # Database connection setup
├── constants/    # Centralized magic strings, HTTP status codes
├── controllers/  # HTTP request/response handlers
├── middlewares/  # Express middlewares (Validation, Auth, Upload, Error handling)
├── repositories/ # PostgreSQL queries (Data layer)
├── routes/       # API routing definitions
├── services/     # Business logic, pagination, image replacement
├── startup/      # Initialization scripts (directory creation)
├── utils/        # Shared helper functions (Response formatting, etc.)
├── validators/   # Request validation rules
├── app.js        # Express app configuration
└── server.js     # Application entry point
```

## Installation
1. Clone the repository to your local machine.
2. Install dependencies:
   ```bash
   npm install
   ```

## Environment Setup
Copy the `.env.example` file to create your local `.env` file:
```bash
cp .env.example .env
```
Ensure you configure your `DATABASE_URL` and `JWT_SECRET` properly. See [ENVIRONMENT.md](ENVIRONMENT.md) for details.

## Running Locally
To start the development server with live reload:
```bash
npm run dev
```

## API Version
The current API version is **v1**. All routes are prefixed with `/api/v1`.

## Important Notes
- **Timezone**: The server and database operate strictly on `Asia/Jakarta` (UTC+7).
- **Authentication**: Authentication is purely stateless using JWT.
- **File Storage**: Uploaded files are stored locally in the `uploads/` directory. Ensure this folder has write permissions.
