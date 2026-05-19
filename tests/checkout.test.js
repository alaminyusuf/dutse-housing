/**
 * E2E integration test for the checkout, PIN verification, and order certificate completion flow.
 * Can be run directly via: node tests/checkout.test.js
 */
const http = require("http");

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
		// 1. Register David in MongoDB (in case collection is clear)
		console.log("1. Registering david@example.com in MongoDB...");
		const regRes = await makeRequest("http://localhost:5000/api/auth/register", "POST", {}, {
			name: "David",
			email: "david@example.com",
			password: "password123"
		});

		let token = "";
		if (regRes.status === 200) {
			token = regRes.data.token;
			console.log("   Registration success! Token retrieved.");
		} else if (regRes.status === 400 && regRes.data.message === "User already exists") {
			console.log("   User already exists, attempting Login...");
			const loginRes = await makeRequest("http://localhost:5000/api/auth/login", "POST", {}, {
				email: "david@example.com",
				password: "password123"
			});
			if (loginRes.status !== 200) {
				throw new Error("Login failed: " + JSON.stringify(loginRes.data));
			}
			token = loginRes.data.token;
			console.log("   Login success! Token retrieved.");
		} else {
			throw new Error("Registration failed: " + JSON.stringify(regRes.data));
		}

		// 2. Fetch all properties to find "Stunning Beachfront Manor" ID
		console.log("2. Fetching available listings...");
		const propsRes = await makeRequest("http://localhost:5000/api/properties", "GET");
		if (propsRes.status !== 200) {
			throw new Error("Failed to fetch properties");
		}

		const beachfrontProp = propsRes.data.find(p => p.title === "Stunning Beachfront Manor");
		if (!beachfrontProp) {
			throw new Error("Could not find 'Stunning Beachfront Manor' in properties list!");
		}

		console.log(`   Found 'Stunning Beachfront Manor' with ID: ${beachfrontProp._id}, Price: $${beachfrontProp.price}`);

		// 3. Initiate checkout using David's 4-digit PIN 7347
		console.log("3. Initiating PIN checkout simulation...");
		const checkoutRes = await makeRequest(
			"http://localhost:5000/api/checkout/create-session",
			"POST",
			{ Authorization: `Bearer ${token}` },
			{ propertyId: beachfrontProp._id, pin: "7347" }
		);

		if (checkoutRes.status !== 200) {
			throw new Error("Checkout session creation failed: " + JSON.stringify(checkoutRes.data));
		}

		console.log("   Checkout processed! Success URL:", checkoutRes.data.url);

		// 4. Wait 2 seconds for Webhook delivery
		console.log("4. Waiting for payment webhook completion...");
		await new Promise(r => setTimeout(r, 2000));

		// 5. Fetch purchased orders
		console.log("5. Fetching active purchases for David...");
		const ordersRes = await makeRequest(
			"http://localhost:5000/api/orders/me",
			"GET",
			{ Authorization: `Bearer ${token}` }
		);

		if (ordersRes.status !== 200) {
			throw new Error("Failed to fetch orders: " + JSON.stringify(ordersRes.data));
		}

		const purchasedManor = ordersRes.data.find(o => o.property._id === beachfrontProp._id);
		if (!purchasedManor) {
			throw new Error("David's orders list does not contain 'Stunning Beachfront Manor'!");
		}

		console.log("==================================================");
		console.log("🏆 SUCCESS! E2E Transaction completed successfully!");
		console.log(`- Purchased Property: ${purchasedManor.property.title}`);
		console.log(`- Amount Paid: $${purchasedManor.amountTotal || beachfrontProp.price}`);
		console.log(`- PDF Certificate Available: ${!!purchasedManor.pdfPath}`);
		console.log("==================================================");
	} catch (err) {
		console.error("❌ Test failed:", err.message || err);
		process.exit(1);
	}
}

runTest();
