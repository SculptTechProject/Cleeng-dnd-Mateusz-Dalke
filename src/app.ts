/*
 !    Main application file setting up the Express server,
 ^    middleware, and routes.
 */
import express from "express";

import preferences from "./routes/preferences.js";
import events from "./routes/events.js";

const app = express();

const API_PREFIX = process.env.API_PREFIX ?? "/api/v1";

app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// API routes
app.use(`${API_PREFIX}/preferences`, preferences);
app.use(`${API_PREFIX}/events`, events);

export default app;
