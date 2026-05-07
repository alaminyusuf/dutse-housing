/**
 * Property routes for listing and viewing properties.
 * @module routes/properties
 */
const express = require("express");
const router = express.Router();
const Property = require("../models/Property");

/**
 * List all properties.
 * @route GET /api/properties
 * @returns {Property[]}
 */
router.get("/", async (req, res) => {
	try {
		const props = await Property.find().limit(50);
		res.json(props);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

/**
 * Get a single property by ID.
 * @route GET /api/properties/:id
 * @returns {Property}
 */
router.get("/:id", async (req, res) => {
	try {
		const prop = await Property.findById(req.params.id);
		if (!prop) return res.status(404).json({ message: "Property not found" });
		res.json(prop);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
});

module.exports = router;
