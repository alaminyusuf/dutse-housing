/**
 * Token routes replaced by Deposit Request workflow.
 * Endpoint: POST /api/deposit/generate
 * Body: { amount, pin } — creates a DepositRequest (amount in USD) for admin approval.
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../models/User");
const DepositRequest = require("../models/DepositRequest");

router.post("/generate", auth, async (req, res) => {
	const { amount, pin } = req.body;
	if (!pin || !/^\d{4}$/.test(pin)) {
		return res.status(400).json({ message: "PIN must be exactly 4 digits" });
	}
	if (amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
		return res.status(400).json({ message: "Invalid amount" });
	}

	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (!user.pinSet || !user.pinHash)
			return res.status(400).json({ message: "User has not set a PIN" });

		const ok = await bcrypt.compare(pin, user.pinHash);
		if (!ok) return res.status(401).json({ message: "Invalid PIN" });

		const amountCents = Math.round(Number(amount) * 100);
		const dr = new DepositRequest({ user: user._id, amountCents });
		await dr.save();

		return res.json({
			message: "Deposit request created and pending approval",
		});
	} catch (err) {
		console.error(err);
		return res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
