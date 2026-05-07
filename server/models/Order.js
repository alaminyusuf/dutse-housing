/**
 * Order model schema.
 * @typedef {Object} Order
 * @property {ObjectId} user - Reference to User
 * @property {ObjectId} property - Reference to Property
 * @property {number} amount - Purchase amount
 * @property {string} status - Order status (pending|paid|failed)
 * @property {string} stripeSessionId - Stripe session ID
 * @property {string} pdfPath - Path to generated PDF
 * @property {Date} createdAt - Order creation date
 */
const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
	user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
	property: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Property",
		required: true,
	},
	amount: { type: Number, required: true },
	status: {
		type: String,
		enum: ["pending", "paid", "failed"],
		default: "pending",
	},
	stripeSessionId: { type: String },
	pdfPath: { type: String },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Order", OrderSchema);
