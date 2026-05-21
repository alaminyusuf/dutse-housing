const request = require("supertest");
const mongoose = require("mongoose");

let mongod;
let app;

jest.setTimeout(30000);

beforeAll(async () => {
	const { MongoMemoryServer } = require("mongodb-memory-server");
	mongod = await MongoMemoryServer.create();
	process.env.MONGO_URI = mongod.getUri();

	// Require the app after setting MONGO_URI so the server connects to memory
	app = require("../index");

	// Wait for mongoose to be connected
	await new Promise((resolve) => {
		const check = () => {
			if (mongoose.connection.readyState === 1) return resolve();
			setTimeout(check, 50);
		};
		check();
	});
});

afterAll(async () => {
	await mongoose.disconnect();
	if (mongod) await mongod.stop();
});

test("full deposit and purchase flow", async () => {
	const agent = request(app);

	// Health check
	const health = await agent.get("/");
	expect(health.status).toBe(200);

	// Register user
	const reg = await agent.post("/api/auth/register").send({
		name: "Buyer",
		email: "buyer@example.com",
		password: "password123",
	});
	expect(reg.status).toBe(200);
	const token = reg.body.token;
	expect(token).toBeTruthy();

	// Set PIN for buyer
	const pinRes = await agent
		.post("/api/auth/pin")
		.set("Authorization", `Bearer ${token}`)
		.send({ pin: "1234" });
	expect(pinRes.status).toBe(200);

	// Create a property directly in DB (price $5)
	const Property = require("../models/Property");
	const prop = new Property({
		title: "Test Property",
		houseNumber: "1A",
		location: "Testville",
		price: 5,
		description: "A test property",
	});
	await prop.save();

	// Create a deposit request for $5
	const depositRes = await agent
		.post("/api/deposit/generate")
		.set("Authorization", `Bearer ${token}`)
		.send({ amount: 5, pin: "1234" });
	expect(depositRes.status).toBe(200);

	// Create an admin user directly and issue a token
	const User = require("../models/User");
	const admin = new User({
		name: "Admin",
		email: "admin@example.com",
		password: "x",
		role: "admin",
	});
	await admin.save();
	const jwt = require("jsonwebtoken");
	const adminToken = jwt.sign(
		{ id: admin._id },
		process.env.JWT_SECRET || "secret",
	);

	// List deposits and approve the first
	const deposits = await agent
		.get("/api/admin/deposits")
		.set("Authorization", `Bearer ${adminToken}`);
	expect(deposits.status).toBe(200);
	expect(Array.isArray(deposits.body)).toBeTruthy();
	expect(deposits.body.length).toBeGreaterThan(0);

	const depositId = deposits.body[0]._id;
	const approve = await agent
		.post(`/api/admin/deposits/${depositId}/approve`)
		.set("Authorization", `Bearer ${adminToken}`)
		.send();
	expect(approve.status).toBe(200);

	// Buyer should now have balance to buy the property
	const buyer = await User.findOne({ email: "buyer@example.com" });
	expect(buyer.balance).toBeGreaterThanOrEqual(500);

	// Charge the property
	const charge = await agent
		.post("/api/payments/charge")
		.set("Authorization", `Bearer ${token}`)
		.send({ pin: "1234", propertyId: prop._id.toString() });
	expect(charge.status).toBe(200);
	expect(charge.body.message).toMatch(/Charge successful/i);

	// Property should now be marked sold
	const purchased = await Property.findById(prop._id);
	expect(purchased.sold).toBeTruthy();
});
