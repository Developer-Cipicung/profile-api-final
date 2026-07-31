# Development Guide: Website Profil Desa Cipicung API

This guide provides step-by-step instructions on how to set up the development environment for the backend API from scratch.

---

## 1. Prerequisites
Before you begin, ensure you have the following installed on your machine:
- **Node.js**: v18.x or higher (LTS recommended)
- **npm**: v9.x or higher
- **PostgreSQL**: v14 or higher
- **Git**

---

## 2. Installing and Configuring PostgreSQL

If you haven't installed PostgreSQL yet:
1. Download the installer from the [official PostgreSQL website](https://www.postgresql.org/download/).
2. Run the installer and remember the **postgres** user password you set during installation.
3. Make sure the PostgreSQL service is running.

### Create the Database
You can create the database using the command line (`psql`) or a GUI tool like pgAdmin or DBeaver.

**Using psql (Command Line):**
1. Open your terminal or command prompt.
2. Log in to PostgreSQL:
   ```bash
   psql -U postgres
   ```
3. Run the following SQL command to create the database:
   ```sql
   CREATE DATABASE desa_cipicung;
   ```
4. Verify the database was created:
   ```sql
   \l
   ```
5. Type `\q` to exit psql.

---

## 3. Project Setup

1. **Clone the repository** (if applicable) and navigate to the project directory:
   ```bash
   cd profile-api
   ```

2. **Install Dependencies**:
   Install all required Node.js packages using npm:
   ```bash
   npm install
   ```

---

## 4. Configuring Environment Variables

The project uses a `.env` file to manage sensitive configurations. 

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```
   *(On Windows, you can use `copy .env.example .env` or just duplicate the file manually).*

2. Open the `.env` file and configure the values:
   ```env
   PORT=3000
   
   # Replace "password" with your actual postgres user password
   DATABASE_URL=postgresql://postgres:password@localhost:5432/desa_cipicung
   
   DEFAULT_NEWS_IMAGE=/uploads/default-news.png
   DEFAULT_PRODUCT_IMAGE=/uploads/default-product.png
   TZ=Asia/Jakarta
   ```

---

## 5. Running the Server

Once the database is created and dependencies are installed, you can start the application.

1. **Start the development server**:
   ```bash
   npm run dev
   ```

### Expected Console Output
If everything is configured correctly, you should see the following output in your terminal:
```text
Application initialized successfully.
Server is running in development mode on port 3000
Connected to PostgreSQL Database
```

---

## 6. Testing the Setup

To verify that the server is running correctly, open your browser or a tool like Postman and navigate to:
```
http://localhost:3000/health
```

**Expected JSON Response:**
```json
{
  "status": "OK",
  "uptime": 12,
  "timestamp": "2026-07-05T01:30:00.000Z"
}
```

---

## 7. Basic Troubleshooting

- **Error: `Role "user" does not exist` or `password authentication failed`**
  - *Fix*: Check your `DATABASE_URL` in the `.env` file. Ensure the username (usually `postgres`) and password match what you set during PostgreSQL installation.

- **Error: `database "desa_cipicung" does not exist`**
  - *Fix*: You missed the step to create the database. Open `psql` or pgAdmin and run `CREATE DATABASE desa_cipicung;`.

- **Error: `EADDRINUSE: address already in use :::3000`**
  - *Fix*: Another application is already running on port 3000. Change the `PORT` variable in your `.env` file (e.g., `PORT=3001`) and restart the server.

- **Console missing "Connected to PostgreSQL Database"**
  - *Fix*: The application failed to connect to the database. Ensure the PostgreSQL service is running on your machine (check Windows Services, macOS Homebrew, or Linux systemctl).
