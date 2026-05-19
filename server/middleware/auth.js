/**
 * Authentication middleware.
 * Verifies JWT from Authorization header or URL token queries.
 * 
 * @module middleware/auth
 */
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
	let authHeader = req.headers.authorization;
	// Allow token via query for direct media/PDF downloads if needed
	if (!authHeader && req.query && req.query.token) {
		authHeader = `Bearer ${req.query.token}`;
	}
	if (!authHeader) {
		return res.status(401).json({ message: "Unauthorized: Missing token" });
	}
	const parts = authHeader.split(" ");
	if (parts.length !== 2) {
		return res.status(401).json({ message: "Unauthorized: Invalid token format" });
	}
	try {
		const decoded = jwt.verify(parts[1], process.env.JWT_SECRET || "secret");
		req.userId = decoded.id;
		next();
	} catch (err) {
		return res.status(401).json({ message: "Unauthorized: Token verification failed" });
	}
}

module.exports = auth;
