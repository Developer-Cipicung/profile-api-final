import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { initializeApp } from "./startup/init.js";
import { publicNewsRouter, adminNewsRouter } from "./routes/news.routes.js";
import {
  publicProductRouter,
  adminProductRouter,
} from "./routes/product.routes.js";
import { authRouter } from "./routes/auth.routes.js";
import { adminAdminRouter } from "./routes/admin.routes.js";
import {
  adminPopulationRouter,
  publicPopulationRouter,
} from "./routes/population.routes.js";
import { imageRouter } from "./routes/image.routes.js";

initializeApp();

const app = express();

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    origin: [
      "https://profile-cipicung-admin.vercel.app",
      "https://cijeruk-cipicung.vercel.app",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://192.168.111.136:5173",
      "https://portal.cijeruk-cipicung.com",
    ],
    credentials: true,
  }),
);

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

const API_PREFIX = "/api/v1";

// Proxy Route for images (used if R2_PUBLIC_URL is not set)
app.use(`${API_PREFIX}/images`, imageRouter);

// Auth Routes
app.use(`${API_PREFIX}/auth`, authRouter);

// Public Routes
app.use(`${API_PREFIX}/news`, publicNewsRouter);
app.use(`${API_PREFIX}/products`, publicProductRouter);
app.use(`${API_PREFIX}/population`, publicPopulationRouter);

// Admin Routes
app.use(`${API_PREFIX}/admin/news`, adminNewsRouter);
app.use(`${API_PREFIX}/admin/products`, adminProductRouter);
app.use(`${API_PREFIX}/admin/administrators`, adminAdminRouter);
app.use(`${API_PREFIX}/admin/population`, adminPopulationRouter);

app.use(notFoundHandler);

app.use(errorHandler);

export default app;
