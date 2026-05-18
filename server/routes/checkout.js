/**
 * Checkout routes for payment-cli integration.
 * @module routes/checkout
 */
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
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
 * Create a checkout session for a property purchase via payment-cli 4-digit PIN.
 * @route POST /api/checkout/create-session
 * @body { propertyId, pin }
 * @returns { url, id }
 */
router.post("/create-session", async (req, res) => {
	const { propertyId, pin } = req.body;
	const userId = getUserIdFromReq(req);
	if (!userId) return res.status(401).json({ message: "Unauthorized" });
	if (!pin) return res.status(400).json({ message: "Payment PIN is required" });

	try {
		const property = await Property.findById(propertyId);
		if (!property)
			return res.status(404).json({ message: "Property not found" });

		// Generate session ID beforehand to prevent race conditions in webhook processing
		const sessionId = `cs_test_${crypto.randomUUID().replace(/-/g, "")}`;

		// Create and save pending order first so the webhook handler can immediately find it
		const order = new Order({
			user: userId,
			property: property._id,
			amount: property.price,
			status: "pending",
			stripeSessionId: sessionId,
		});
		await order.save();

		// Call the local payment-cli Koa server to handle the transaction
		const response = await fetch("http://localhost:3000/checkout/create-session", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				pin,
				userId: userId.toString(),
				propertyId: property._id.toString(),
				amount: Math.round(property.price * 100), // convert dollars to cents
				sessionId,
			}),
		});

		if (!response.ok) {
			const errData = await response.json().catch(() => ({}));
			// Delete the pending order if the payment process failed
			await Order.deleteOne({ _id: order._id });
			return res.status(400).json({ message: errData.error || "Payment processing error" });
		}

		const session = await response.json(); // { id: sessionId, url: redirectUrl }
		res.json({ url: session.url, id: session.id });
	} catch (err) {
		console.error("Checkout integration error:", err);
		res.status(500).json({ message: "Payment service connection error" });
	}
});

module.exports = router;
