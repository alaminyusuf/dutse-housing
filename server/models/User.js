/**
 * User model schema.
 * @typedef {Object} User
 * @property {string} name - User's full name
 * @property {string} email - User's email (unique)
 * @property {string} password - Hashed password
 * @property {string} role - User's role (user or admin)
 * @property {Date} createdAt - Account creation date
 */
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true },
	password: { type: String, required: true },
	role: { type: String, enum: ["user", "admin"], default: "user" },
	// Hashed 4-digit PIN for quick payment authorization (not plaintext)
	pinHash: { type: String },
	// Indicates whether the user has set a PIN (defaults false)
	pinSet: { type: Boolean, default: false },
	// Optional account balance in cents for token-based payments
	balance: { type: Number, default: 0 },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
