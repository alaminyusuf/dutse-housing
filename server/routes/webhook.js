const express = require("express");
const router = express.Router({ rawBody: true });
const stripe = require("stripe")(
	process.env.STRIPE_SECRET_KEY || "sk_test_placeholder",
);
const Order = require("../models/Order");
const Property = require("../models/Property");
const User = require("../models/User");
const { generateCertificate } = require("../lib/pdf");

// POST /api/webhook (Stripe webhook)
router.post(
	"/",
	express.raw({ type: "application/json" }),
	async (req, res) => {
		const sig = req.headers["stripe-signature"];
		const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || "";
		let event;
		try {
			if (endpointSecret) {
				event = stripe.webhooks.constructEvent(
					req.body,
					sig,
					endpointSecret,
				);
			} else {
				// If no webhook secret configured, parse body directly (not recommended)
				event = req.body;
			}
		} catch (err) {
			console.error("Webhook signature verification failed.", err.message);
			return res.status(400).send(`Webhook Error: ${err.message}`);
		}

		// Handle the checkout.session.completed event
		if (
			event.type === "checkout.session.completed" ||
			(event.object &&
				event.object.type === "checkout.session" &&
				event.object.status === "complete")
		) {
			const session = event.data ? event.data.object : event;
			const metadata = session.metadata || {};
			const stripeSessionId = session.id || session.session_id || null;
			try {
				const order = await Order.findOne({ stripeSessionId });
				if (!order) {
					console.warn("Order not found for session:", stripeSessionId);
					return res.json({ received: true });
				}
				order.status = "paid";
				await order.save();

				// populate user and property
				const user = await User.findById(order.user);
				const property = await Property.findById(order.property);
				// generate PDF
				const pdfPath = await generateCertificate({
					orderId: order._id.toString(),
					user,
					property,
				});
				order.pdfPath = pdfPath;
				await order.save();

				console.log("Order completed and PDF generated:", pdfPath);
			} catch (err) {
				console.error("Error processing webhook:", err);
			}
		}

		res.json({ received: true });
	},
);

module.exports = router;
