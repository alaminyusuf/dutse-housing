/**
 * Seeds the database with sample properties and default System Administrator.
 * @module seed
 */

const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");
const connectDB = require("./config/db");
const Property = require("./models/Property");
const User = require("./models/User");
const Token = require("./models/Token");
const Order = require("./models/Order");

dotenv.config();

/**
 * Seed function: clears Property collection, clears admin record, and inserts default sample data.
 */
async function seed() {
	await connectDB();

	try {
		await Property.deleteMany({});
		await Order.deleteMany({});
		await User.deleteMany({});
		await Token.deleteMany({});
		// Seed administrator user
		const adminEmail = "admin@example.com";
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash("adminpassword", salt);

		const adminUser = new User({
			name: "System Admin",
			email: adminEmail,
			password: hashedPassword,
			role: "admin",
		});
		await adminUser.save();
		console.log(
			"Seeded system administrator successfully (admin@example.com / adminpassword)",
		);

		process.exit(0);
	} catch (err) {
		console.error("Seed error:", err);
		process.exit(1);
	}
}

seed();
