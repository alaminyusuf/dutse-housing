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
							reject(new Error(parsed.error || "Failed request to payment microservice"));
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

	if (!email || amount === undefined || isNaN(Number(amount)) || Number(amount) <= 0) {
		return res.status(400).json({ message: "Missing or invalid email or dollar amount" });
	}

	const balanceCents = Math.round(Number(amount) * 100);

	try {
		const result = await postToKoa("http://localhost:3000/admin/generate-balance", {
			email,
			balance: balanceCents,
		});
		res.json({
			message: "Balance credited successfully",
			customer: result.customer,
		});
	} catch (err) {
		console.error("Admin balance top-up error:", err.message || err);
		res.status(500).json({
			message: err.message || "Failed to communicate with payment-cli server",
		});
	}
});

module.exports = router;
