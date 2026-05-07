const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(
	process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);
const Property = require("../models/Property");
const Order = require("../models/Order");

// helper to get user id from token (Authorization: Bearer <token>)
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

// POST /api/checkout/create-session
router.post("/create-session", async (req, res) => {
	const { propertyId } = req.body;
	const userId = getUserIdFromReq(req);
	if (!userId) return res.status(401).json({ message: "Unauthorized" });
	try {
		const property = await Property.findById(propertyId);
		if (!property)
			return res.status(404).json({ message: "Property not found" });

		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			mode: "payment",
			line_items: [
				{
					price_data: {
						currency: "usd",
						product_data: {
							name: property.title,
							description: `${property.houseNumber} - ${property.location}`,
						},
						unit_amount: Math.round(property.price * 100),
					},
					quantity: 1,
				},
			],
			success_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.CLIENT_URL || "http://localhost:3000"}/cancel`,
			metadata: {
				userId: userId.toString(),
				propertyId: property._id.toString(),
			},
		});

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
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
