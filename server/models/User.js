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
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("User", UserSchema);
