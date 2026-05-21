/**
 * Authentication middleware.
 * Verifies JWT from Authorization header or URL token queries.
 *
 * @module middleware/auth
 */
const jwt = require("jsonwebtoken");

function auth(req, res, next) {
	// Check Authorization header, query token, or HTTP cookie 'token'
	let token = null;

	token =
		req.cookies.token ||
		(req.headers.authorization && req.headers.authorization.split(" ")[1]);

	if (!token)
		return res.status(401).json({ message: "Unauthorized: Missing token" });

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret");
		req.userId = decoded.id;
		next();
	} catch (err) {
		console.log(err);
		return res
			.status(401)
			.json({ message: "Unauthorized: Token verification failed" });
	}
}

module.exports = auth;
