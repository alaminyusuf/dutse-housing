/**
 * Main entry point for Dutse Housing Express server.
 * Sets up middleware, connects to MongoDB, and mounts all API routes.
 *
 * @module server/index
 */
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const path = require("path");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
// Parse JSON and keep raw body for Stripe webhook signature verification
app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);
// Enable CORS for client
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
// Parse cookies for cookie-based auth
app.use(cookieParser());
// Log HTTP requests
app.use(morgan("dev"));

// Serve static assets from storage directory
app.use("/storage", express.static(path.join(__dirname, "storage")));

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Mount API routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/webhook", require("./routes/webhook"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/admin", require("./routes/admin"));
// Payments and deposit endpoints
app.use("/api/payments", require("./routes/payments"));
app.use("/api/deposit", require("./routes/deposit"));

// Health check route
app.get("/", (req, res) => res.send("Dutse Housing API"));

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
