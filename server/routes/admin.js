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
const http = require("http");

/**
 * Helper to post request payload to payment-cli Koa microservice.
 */
function postToKoa(url, data) {
	return new Promise((resolve, reject) => {
		try {
			const parsedUrl = new URL(url);
			const postData = JSON.stringify(data);

			const options = {
				hostname: parsedUrl.hostname,
				port: parsedUrl.port,
				path: parsedUrl.pathname,
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Content-Length": Buffer.byteLength(postData),
				},
			};

			const req = http.request(options, (res) => {
				let responseData = "";
				res.on("data", (chunk) => {
					responseData += chunk;
				});
				res.on("end", () => {
					try {
						const parsed = JSON.parse(responseData);
						if (res.statusCode && res.statusCode >= 400) {
							reject(
								new Error(
									parsed.error ||
										"Failed request to payment microservice",
								),
							);
						} else {
							resolve(parsed);
						}
					} catch (err) {
						reject(new Error("Invalid microservice JSON response"));
					}
				});
			});

			req.on("error", (err) => {
				reject(err);
			});

			req.write(postData);
			req.end();
		} catch (err) {
			reject(err);
		}
	});
}

/**
 * Generate/Top-up balance for a user.
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

	const balanceCents = Math.round(Number(amount) * 100);

	try {
		// 1. Update and increment the balance directly in your MongoDB database
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

		// 2. Keep your external Koa service communication if it's still needed
		const result = await postToKoa(
			"http://localhost:3000/admin/generate-balance",
			{
				email,
				balance: balanceCents,
			},
		);

		res.json({
			message: "Balance credited successfully",
			currentBalanceCents: updatedUser.balance, // Sending back the new total balance
			customer: result.customer,
		});
	} catch (err) {
		console.error("Admin balance top-up error:", err.message || err);
		res.status(500).json({
			message:
				err.message ||
				"Failed to update balance or communicate with payment-cli server",
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
