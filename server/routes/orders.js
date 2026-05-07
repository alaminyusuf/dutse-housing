/**
 * Order routes for user purchases and PDF download.
 * @module routes/orders
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Order = require("../models/Order");
const fs = require("fs");
const path = require("path");

/**
 * Middleware to authenticate user via JWT in Authorization header or ?token= query.
 */
function auth(req, res, next) {
	// allow token via Authorization header or `?token=` query for direct browser downloads
	let auth = req.headers.authorization;
	if (!auth && req.query && req.query.token)
		auth = `Bearer ${req.query.token}`;
	if (!auth) return res.status(401).json({ message: "Unauthorized" });
	const parts = auth.split(" ");
	if (parts.length !== 2)
		return res.status(401).json({ message: "Unauthorized" });
	try {
		const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || "secret");
		req.userId = decoded.id;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Unauthorized" });
	}
}

/**
 * Get all orders for the authenticated user.
 * @route GET /api/orders/me
 * @returns {Order[]}
 */
router.get("/me", auth, async (req, res) => {
	try {
		const orders = await Order.find({ user: req.userId }).populate(
			"property",
		);
		res.json(orders);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Download the PDF certificate for a specific order (must be owner).
 * @route GET /api/orders/:id/pdf
 * @returns {PDF file}
 */
router.get("/:id/pdf", auth, async (req, res) => {
	try {
		const order = await Order.findById(req.params.id).populate("property");
		if (!order) return res.status(404).json({ message: "Order not found" });
		if (order.user.toString() !== req.userId)
			return res.status(403).json({ message: "Forbidden" });
		if (!order.pdfPath)
			return res.status(404).json({ message: "PDF not available" });
		const filePath = path.resolve(order.pdfPath);
		if (!fs.existsSync(filePath))
			return res.status(404).json({ message: "File not found" });
		res.download(filePath);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
