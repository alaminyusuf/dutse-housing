/**
 * E2E integration test for the checkout, PIN verification, and order certificate completion flow.
 * Dynamically logs in as admin, tops up the customer's balance to ensure it is above the $100k threshold,
 * generates a transaction PIN via payment-cli, and executes checkout.
 * Can be run directly via: node tests/checkout.test.js
 */
const http = require("http");
const { execSync } = require("child_process");
const path = require("path");

function makeRequest(url, method, headers = {}, body = null) {
	return new Promise((resolve, reject) => {
		const parsedUrl = new URL(url);
		const postData = body ? JSON.stringify(body) : "";

		const options = {
			hostname: parsedUrl.hostname,
			port: parsedUrl.port,
			path: parsedUrl.pathname + parsedUrl.search,
			method: method,
			headers: {
				...headers,
				"Content-Type": "application/json",
			},
		};

		if (body) {
			options.headers["Content-Length"] = Buffer.byteLength(postData);
		}

		const req = http.request(options, (res) => {
			let responseData = "";
			res.on("data", (chunk) => {
				responseData += chunk;
			});
			res.on("end", () => {
				try {
					const parsed = responseData ? JSON.parse(responseData) : {};
					resolve({ status: res.statusCode, data: parsed });
				} catch (err) {
					resolve({ status: res.statusCode, raw: responseData });
				}
			});
		});

		req.on("error", (err) => reject(err));
		if (body) {
			req.write(postData);
		}
		req.end();
	});
}

async function runTest() {
	console.log("=== Dutse Housing API E2E Integration Test ===");

	try {
		// 1. Log in as seeded System Admin
		console.log("1. Logging in as Administrator (admin@example.com)...");
		const adminLogin = await makeRequest("http://localhost:5000/api/auth/login", "POST", {}, {
			email: "admin@example.com",
			password: "adminpassword"
		});

		if (adminLogin.status !== 200) {
			throw new Error("Admin login failed: " + JSON.stringify(adminLogin.data));
		}
		const adminToken = adminLogin.data.token;
		console.log("   Admin login success!");

		// 2. Top-up David's balance in Koa ledger using Admin Endpoint to ensure balance > $100k
		console.log("2. Top-up David's ledger balance by $250,000.00 via Admin Panel route...");
		const creditRes = await makeRequest(
			"http://localhost:5000/api/admin/generate-balance",
			"POST",
			{ Authorization: `Bearer ${adminToken}` },
			{ email: "david@example.com", amount: 250000 }
		);

		if (creditRes.status !== 200) {
			throw new Error("Failed to credit customer balance: " + JSON.stringify(creditRes.data));
		}
		console.log(`   Credit success! David's total balance is now: $${creditRes.data.customer.balance / 100}`);

		// Wait 1.5 seconds for file system settling
		console.log("   Waiting 1.5s for JSON database persistence settling...");
		await new Promise(r => setTimeout(r, 1500));

		// 3. Register/Login David in MongoDB
		console.log("3. Registering/Logging in david@example.com...");
		const regRes = await makeRequest("http://localhost:5000/api/auth/register", "POST", {}, {
			name: "David",
			email: "david@example.com",
			password: "password123"
		});

		let userToken = "";
		if (regRes.status === 200) {
			userToken = regRes.data.token;
			console.log("   Registration success! Token retrieved.");
		} else if (regRes.status === 400 && regRes.data.message === "User already exists") {
			console.log("   User already exists, performing Login instead...");
			const loginRes = await makeRequest("http://localhost:5000/api/auth/login", "POST", {}, {
				email: "david@example.com",
				password: "password123"
			});
			if (loginRes.status !== 200) {
				throw new Error("Login failed: " + JSON.stringify(loginRes.data));
			}
			userToken = loginRes.data.token;
			console.log("   Login success! Token retrieved.");
		} else {
			throw new Error("Registration failed: " + JSON.stringify(regRes.data));
		}

		// 4. Fetch all properties to find "Stunning Beachfront Manor" ID
		console.log("4. Fetching available listings...");
		const propsRes = await makeRequest("http://localhost:5000/api/properties", "GET");
		if (propsRes.status !== 200) {
			throw new Error("Failed to fetch properties");
		}

		const beachfrontProp = propsRes.data.find(p => p.title === "Stunning Beachfront Manor");
		if (!beachfrontProp) {
			throw new Error("Could not find 'Stunning Beachfront Manor' in properties list!");
		}

		console.log(`   Found 'Stunning Beachfront Manor' with ID: ${beachfrontProp._id}, Price: $${beachfrontProp.price}`);

		// 5. Dynamically generate a fresh checkout PIN for David
		console.log("5. Generating a fresh 4-digit transaction PIN via payment-cli...");
		const cliOutput = execSync("node payment-cli/dist/index.js tokens generate --customer david@example.com").toString();
		const pinMatch = cliOutput.match(/PIN \(4-Digit\):\s*(\d+)/);
		if (!pinMatch) {
			throw new Error("Failed to generate or parse PIN from CLI output: " + cliOutput);
		}
		const dynamicPin = pinMatch[1];
		console.log(`   Successfully generated dynamic PIN: ${dynamicPin}`);

		// 6. Initiate checkout using David's fresh dynamic PIN
		console.log(`6. Initiating checkout using PIN ${dynamicPin}...`);
		const checkoutRes = await makeRequest(
			"http://localhost:5000/api/checkout/create-session",
			"POST",
			{ Authorization: `Bearer ${userToken}` },
			{ propertyId: beachfrontProp._id, pin: dynamicPin }
		);

		if (checkoutRes.status !== 200) {
			throw new Error("Checkout session creation failed: " + JSON.stringify(checkoutRes.data));
		}

		console.log("   Checkout processed! Success URL:", checkoutRes.data.url);

		// 7. Wait 2 seconds for Webhook delivery & PDF generation
		console.log("7. Waiting for payment webhook completion and horizontal PDF generation...");
		await new Promise(r => setTimeout(r, 2000));

		// 8. Fetch purchased orders
		console.log("8. Fetching active purchases for David...");
		const ordersRes = await makeRequest(
			"http://localhost:5000/api/orders/me",
			"GET",
			{ Authorization: `Bearer ${userToken}` }
		);

		if (ordersRes.status !== 200) {
			throw new Error("Failed to fetch orders: " + JSON.stringify(ordersRes.data));
		}

		// Find orders for beachfront manor
		const orderHistory = ordersRes.data.filter(o => o.property._id === beachfrontProp._id);
		if (orderHistory.length === 0) {
			throw new Error("David's orders list does not contain 'Stunning Beachfront Manor'!");
		}

		const latestOrder = orderHistory[orderHistory.length - 1];
		console.log("==================================================");
		console.log("🏆 SUCCESS! E2E Transaction completed successfully!");
		console.log(`- Purchased Property: ${latestOrder.property.title}`);
		console.log(`- Amount Paid: $${(latestOrder.amountTotal || beachfrontProp.price * 100) / 100}`);
		console.log(`- Horizontal PDF Certificate generated: ${path.basename(latestOrder.pdfPath)}`);
		console.log("==================================================");
	} catch (err) {
		console.error("❌ Test failed:", err.message || err);
		process.exit(1);
	}
}

runTest();
