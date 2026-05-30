const User = require("../models/User");
const DepositRequest = require("../models/DepositRequest");
/**
 * Admin routes for managing platform state and user credits.
 * @module routes/admin
 */
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
/**
 * Generate/Top-up balance for a user directly in the database.
 * @route POST /api/admin/generate-balance
 * @security JWT Admin
 * @body { email, amount } (amount in USD dollars)
 */
router.post("/generate-balance", auth, admin, async (req, res) => {
	const { email, amount } = req.body;

	if (
		!email ||
		amount === undefined ||
		isNaN(Number(amount)) ||
		Number(amount) <= 0
	) {
		return res
			.status(400)
			.json({ message: "Missing or invalid email or dollar amount" });
	}

	const balanceCents = Math.round(Number(amount));

	try {
		// Update and increment the balance directly in your MongoDB database
		const updatedUser = await User.findOneAndUpdate(
			{ email: email.toLowerCase() }, // Good practice to lowerCase email to avoid mismatch
			{ $inc: { balance: balanceCents } }, // $inc automatically adds the amount to the existing balance
			{ new: true }, // Returns the updated document instead of the old one
		);

		if (!updatedUser) {
			return res
				.status(404)
				.json({ message: "User not found with that email" });
		}

		res.json({
			message: "Balance credited successfully",
			currentBalanceCents: updatedUser.balance,
			customer: {
				id: updatedUser._id,
				name: updatedUser.name,
				email: updatedUser.email,
				balance: updatedUser.balance,
			}
		});
	} catch (err) {
		console.error("Admin balance top-up error:", err.message || err);
		res.status(500).json({
			message: err.message || "Failed to update balance in database",
		});
	}
});

// List deposit requests
router.get("/deposits", auth, admin, async (req, res) => {
	try {
		const deposits = await DepositRequest.find()
			.populate("user", "email name")
			.sort({ createdAt: -1 });
		res.json(deposits);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

// Approve a pending deposit request
router.post("/deposits/:id/approve", auth, admin, async (req, res) => {
	try {
		const id = req.params.id;
		const deposit = await DepositRequest.findById(id);
		if (!deposit)
			return res.status(404).json({ message: "Deposit request not found" });
		if (deposit.status !== "pending")
			return res
				.status(400)
				.json({ message: "Only pending deposits can be approved" });

		const user = await User.findById(deposit.user);
		if (!user) return res.status(404).json({ message: "User not found" });

		deposit.status = "approved";
		deposit.approvedAt = new Date();
		deposit.approvedBy = req.userId;
		await deposit.save();

		user.balance = (user.balance || 0) + (deposit.amountCents || 0);
		await user.save();

		const populated = await DepositRequest.findById(deposit._id).populate(
			"user",
			"email name",
		);

		res.json({ deposit: populated, newBalanceCents: user.balance });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
