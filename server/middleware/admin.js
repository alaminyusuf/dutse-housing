/**
 * Admin authorization middleware.
 * Ensures that the authenticated user has the 'admin' role.
 * Expects the standard auth middleware to have run first (populating req.userId).
 *
 * @module middleware/admin
 */
const User = require("../models/User");

async function admin(req, res, next) {
	try {
		if (!req.userId) {
			return res
				.status(401)
				.json({ message: "Unauthorized: Missing authentication" });
		}
		const user = await User.findById(req.userId);
		if (!user) {
			return res
				.status(401)
				.json({ message: "Unauthorized: User not found" });
		}
		if (user.role !== "admin") {
			return res
				.status(403)
				.json({ message: "Forbidden: Admin access required" });
		}
		req.user = user;
		next();
	} catch (err) {
		console.error("Admin middleware error:", err);
		res.status(500).json({ message: "Server error" });
	}
}

module.exports = admin;
