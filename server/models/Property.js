/**
 * Property model schema.
 * @typedef {Object} Property
 * @property {string} title - Property title
 * @property {string} houseNumber - House number
 * @property {string} location - Property location
 * @property {number} price - Price in USD
 * @property {string} description - Description
 * @property {Date} createdAt - Creation date
 */
const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema({
	title: { type: String, required: true },
	houseNumber: { type: String, required: true },
	location: { type: String, required: true },
	price: { type: Number, required: true },
	description: { type: String },
	createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Property", PropertySchema);
