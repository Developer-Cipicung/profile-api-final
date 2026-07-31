# Website Profil Desa Cipicung - Backend API (MVP)

This is the MVP backend API for the official Village Profile Website of Desa Cipicung.

## Folder Structure
```text
src/
├── config/       # Database config
├── constants/    # Magic strings
├── controllers/  # Request handlers
├── database/     # DB schema and seeds (Phase 2)
├── middlewares/  # Express middlewares
├── repositories/ # Database interactions
├── routes/       # API routing
├── services/     # Business logic
├── startup/      # Initialization scripts
├── utils/        # Shared helper functions
├── validators/   # Request validation rules
├── app.js        # Express app
└── server.js     # Entry point
```

## Installation
```bash
npm install
cp .env.example .env
```

## Testing Endpoints
- **Health Check**: `GET /health`
