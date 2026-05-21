/**
 * Token model for bearer payment tokens generated after PIN confirmation.
 */
const mongoose = require("mongoose");

const TokenSchema = new mongoose.Schema({
	token: { type: String, required: true, unique: true },
	owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	status: { type: String, enum: ["active", "revoked"], default: "active" },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Token", TokenSchema);
