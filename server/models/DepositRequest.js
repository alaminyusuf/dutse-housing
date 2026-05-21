const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepositRequestSchema = new mongoose.Schema({
	user: { type: Schema.Types.ObjectId, ref: "User", required: true },
	amountCents: { type: Number, required: true },
	status: {
		type: String,
		enum: ["pending", "approved", "rejected"],
		default: "pending",
	},
	createdAt: { type: Date, default: Date.now },
	approvedAt: { type: Date },
	approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
});

module.exports = mongoose.model("DepositRequest", DepositRequestSchema);
