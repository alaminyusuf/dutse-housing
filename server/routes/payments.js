/**
 * Payments route: finalize a purchase using authenticated user + PIN.
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Property = require("../models/Property");
const Order = require("../models/Order");
const { generateCertificate } = require("../lib/pdf");

/**
 * Charge a property using the authenticated user's balance after PIN confirmation.
 * Body: { pin, propertyId }
 */
router.post("/charge", auth, async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ message: "User not found" });

		const { pin, propertyId } = req.body;
		if (!pin || !/^\d{4}$/.test(pin))
			return res
				.status(400)
				.json({ message: "PIN must be exactly 4 digits" });
		if (!propertyId)
			return res.status(400).json({ message: "Missing propertyId" });

		if (!user.pinSet || !user.pinHash)
			return res.status(400).json({ message: "User has not set a PIN" });

		const ok = await bcrypt.compare(pin, user.pinHash);
		if (!ok) return res.status(401).json({ message: "Invalid PIN" });

		const property = await Property.findById(propertyId);
		if (!property)
			return res.status(404).json({ message: "Property not found" });
		if (property.sold)
			return res.status(400).json({ message: "Property already sold" });

		const amountCents = Math.round((property.price || 0));
		const balance = user.balance || 0;
		if (balance < amountCents)
			return res.status(402).json({ message: "Insufficient funds" });

		user.balance = balance - amountCents;
		await user.save();

		
		const order = new Order({
			user: user._id,
			property: property._id,
			amount: property.price,
			status: "paid",

		});
		const pdf = await generateCertificate({
				orderId: order._id.toString(),
				user,
				property,
			});
			order.pdfPath = pdf;
			await order.save();

		property.sold = true;
		await property.save();

		return res.json({ message: "Charge successful", orderId: order._id });
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
