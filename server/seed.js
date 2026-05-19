/**
 * Seeds the database with sample properties and default System Administrator.
 * @module seed
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const User = require("./models/User");

dotenv.config();

/**
 * Seed function: clears Property collection, clears admin record, and inserts default sample data.
 */
async function seed() {
	await connectDB();
	
	const sampleProperties = [
		{
			title: "Cozy Bungalow",
			houseNumber: "A-101",
			location: "Dutse",
			price: 50000,
			description: "A small cozy bungalow.",
		},
		{
			title: "Modern Villa",
			houseNumber: "B-202",
			location: "Dutse",
			price: 150000,
			description: "Spacious modern villa with garden.",
		},
		{
			title: "Downtown Apartment",
			houseNumber: "C-303",
			location: "Dutse",
			price: 80000,
			description: "Apartment in the heart of town.",
		},
	];

	try {
		// Seed properties
		await Property.deleteMany({});
		await Property.insertMany(sampleProperties);
		console.log("Seeded properties successfully");

		// Seed administrator user
		const adminEmail = "admin@example.com";
		await User.deleteMany({ email: adminEmail });

		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("adminpassword", salt);

		const adminUser = new User({
			name: "System Admin",
			email: adminEmail,
			password: hashedPassword,
			role: "admin",
		});
		await adminUser.save();
		console.log("Seeded system administrator successfully (admin@example.com / adminpassword)");

		process.exit(0);
	} catch (err) {
		console.error("Seed error:", err);
		process.exit(1);
	}
}

seed();
