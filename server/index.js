const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
app.use(
	express.json({
		verify: (req, res, buf) => {
			req.rawBody = buf;
		},
	}),
);
app.use(cors({ origin: process.env.CLIENT_URL || true, credentials: true }));
app.use(morgan("dev"));

const PORT = process.env.PORT || 5000;

// connect DB
connectDB();

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/properties", require("./routes/properties"));
app.use("/api/checkout", require("./routes/checkout"));
app.use("/api/webhook", require("./routes/webhook"));
app.use("/api/orders", require("./routes/orders"));

app.get("/", (req, res) => res.send("Dutse Housing API"));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
