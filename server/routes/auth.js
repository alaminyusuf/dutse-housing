/**
 * Auth routes for user registration and login.
 * @module routes/auth
 */
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

/**
 * Register a new user.
 * @route POST /api/auth/register
 * @body { name, email, password }
 * @returns { token, user }
 */
router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;
	if (!name || !email || !password)
		return res.status(400).json({ message: "Missing fields" });
	try {
		let user = await User.findOne({ email });
		if (user) return res.status(400).json({ message: "User already exists" });
		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(password, salt);

		// Force new registrations to always have the default "user" role
		user = new User({ name, email, password: hashed, role: "user" });
		await user.save();

		const token = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET || "secret",
			{ expiresIn: "7d" },
		);
		// Set HTTP-only cookie for auth and also return token for backward compatibility
		res.cookie("token", token, {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				pinSet: user.pinSet || false,
				balance: user.balance || 0,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Login a user.
 * @route POST /api/auth/login
 * @body { email, password }
 * @returns { token, user }
 */
router.post("/login", async (req, res) => {
	const { email, password } = req.body;
	if (!email || !password)
		return res.status(400).json({ message: "Missing fields" });
	try {
		const user = await User.findOne({ email });
		if (!user)
			return res.status(400).json({ message: "Invalid credentials" });
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch)
			return res.status(400).json({ message: "Invalid credentials" });
		const token = jwt.sign(
			{ id: user._id },
			process.env.JWT_SECRET || "secret",
			{ expiresIn: "7d" },
		);
		res.cookie("token", token, {
			httpOnly: true,
			sameSite: "lax",
			maxAge: 7 * 24 * 60 * 60 * 1000,
		});
		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				pinSet: user.pinSet || false,
				balance: user.balance || 0,
			},
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Get current user profile
 * @route GET /api/auth/me
 */
router.get("/me", auth, async (req, res) => {
	try {
		const user = await User.findById(req.userId).select(
			"name email role pinSet balance",
		);
		if (!user) return res.status(404).json({ message: "User not found" });
		res.json({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			pinSet: user.pinSet,
			balance: user.balance || 0,
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Set a 4-digit PIN for the user. Can only be set once.
 * @route POST /api/auth/pin
 * @body { pin }
 */
router.post("/pin", auth, async (req, res) => {
	const { pin } = req.body;
	if (!pin || !/^\d{4}$/.test(pin)) {
		return res.status(400).json({ message: "PIN must be exactly 4 digits" });
	}
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ message: "User not found" });
		if (user.pinSet)
			return res.status(400).json({ message: "PIN already set" });

		const salt = await bcrypt.genSalt(10);
		const hashed = await bcrypt.hash(pin, salt);
		user.pinHash = hashed;
		user.pinSet = true;
		await user.save();
		res.json({ message: "PIN set successfully" });
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Logout: clear auth cookie
 * @route POST /api/auth/logout
 */
router.post("/logout", (req, res) => {
	res.clearCookie("token");
	res.json({ message: "Logged out" });
});
module.exports = router;
