/**
 * Checkout routes for payment-cli integration.
 * @module routes/checkout
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Property = require("../models/Property");
const Order = require("../models/Order");

/**
 * Helper to extract user ID from JWT in Authorization header.
 * @param {Request} req
 * @returns {string|null}
 */
function getUserIdFromReq(req) {
	const auth = req.headers.authorization;
	if (!auth) return null;
	const parts = auth.split(" ");
	if (parts.length !== 2) return null;
	try {
		const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || "secret");
		return decoded.id;
	} catch (err) {
		return null;
	}
}

/**
 * Create a checkout session for a property purchase via payment-cli.
 * @route POST /api/checkout/create-session
 * @body { propertyId, token }
 * @returns { url, id }
 */
router.post("/create-session", async (req, res) => {
	const { propertyId, token } = req.body;
	const userId = getUserIdFromReq(req);
	if (!userId) return res.status(401).json({ message: "Unauthorized" });
	if (!token) return res.status(400).json({ message: "Payment token is required" });

	try {
		const property = await Property.findById(propertyId);
		if (!property)
			return res.status(404).json({ message: "Property not found" });

		// Call the local payment-cli Koa server to handle the transaction
		const response = await fetch("http://localhost:3000/checkout/create-session", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				token,
				userId: userId.toString(),
				propertyId: property._id.toString(),
				amount: Math.round(property.price * 100), // convert dollars to cents
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			return res.status(400).json({ message: errData.error || "Payment processing error" });
		}

		const session = await response.json(); // { id: sessionId, url: redirectUrl }

		// create order (pending)
		const order = new Order({
			user: userId,
			property: property._id,
			amount: property.price,
			status: "pending",
			stripeSessionId: session.id,
		});
		await order.save();

		res.json({ url: session.url, id: session.id });
	} catch (err) {
		console.error("Checkout integration error:", err);
		res.status(500).json({ message: "Payment service connection error" });
	}
});

module.exports = router;
