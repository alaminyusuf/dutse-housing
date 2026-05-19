/**
 * Property routes for listing, viewing, and admin property creation.
 * @module routes/properties
 */
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Property = require("../models/Property");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Configure Multer Disk Storage
const uploadDir = path.resolve(__dirname, "../storage/uploads");
if (!fs.existsSync(uploadDir)) {
	fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, uploadDir);
	},
	filename: (req, file, cb) => {
		const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
		cb(null, uniqueSuffix + path.extname(file.originalname));
	},
});

const upload = multer({
	storage,
	fileFilter: (req, file, cb) => {
		// Filter file formats to images only
		const allowedTypes = /jpeg|jpg|png|webp|gif/;
		const extname = allowedTypes.test(
			path.extname(file.originalname).toLowerCase(),
		);
		const mimetype = allowedTypes.test(file.mimetype);
		if (extname && mimetype) {
			return cb(null, true);
		}
		cb(
			new Error(
				"Only image formats are allowed (jpeg, jpg, png, webp, gif)",
			),
		);
	},
	limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * List all properties.
 * @route GET /api/properties
 * @returns {Property[]}
 */
router.get("/", async (req, res) => {
	try {
		// Return only properties that are not sold to prevent re-purchase
		const props = await Property.find({ sold: false }).limit(50);
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

/**
 * Admin property creation route.
 * @route POST /api/properties
 * @security JWT Admin
 * @body { title, houseNumber, location, price, description }
 * @file coverImage
 * @returns {Property}
 */
router.post("/", auth, admin, upload.single("coverImage"), async (req, res) => {
	const { title, houseNumber, location, price, description } = req.body;
	if (!title || !houseNumber || !location || !price) {
		return res
			.status(400)
			.json({ message: "Missing required listing fields" });
	}

	try {
		let coverImagePath = "";
		if (req.file) {
			// References static URL path
			coverImagePath = `/storage/uploads/${req.file.filename}`;
		}

		const prop = new Property({
			title,
			houseNumber,
			location,
			price: Number(price),
			description,
			coverImage: coverImagePath,
		});

		await prop.save();
		res.status(201).json(prop);
	} catch (err) {
		console.error("Admin listing creation error:", err);
		res.status(500).json({ message: "Server error creating listing" });
	}
});

module.exports = router;
