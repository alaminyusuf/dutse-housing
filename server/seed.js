dotenv.config();

/**
 * Seeds the database with sample properties for development/testing.
 * @module seed
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Property = require("./models/Property");

dotenv.config();

/**
 * Seed function: clears Property collection and inserts sample data.
 */
async function seed() {
	await connectDB();
	const sample = [
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
		await Property.deleteMany({});
		await Property.insertMany(sample);
		console.log("Seeded properties");
		process.exit(0);
	} catch (err) {
		console.error("Seed error", err);
		process.exit(1);
	}
}

seed();
