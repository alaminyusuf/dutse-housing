import { Command } from "commander";
import axios from "axios";
import { CustomerStore } from "../../models/Customer";
import { TokenStore } from "../../models/Token";
import { connectMongo, mongoose } from "../../utils/db";
import { v4 as uuidv4 } from "uuid";

const cmd = new Command("tokens");

cmd.description("Manage customer payment tokens and PINs");

cmd.command("generate")
	.requiredOption("--customer <emailOrId>")
	.option("--server <url>")
	.option("--auth-token <jwt>")
	.option("--pin <pin>")
	.option("--amount <amount>")
	.action(async (opts) => {
		const customerStore = CustomerStore.getInstance();
		const tokenStore = TokenStore.getInstance();

		const REQUIRED_BALANCE = 5000000; // cents ($50,000)

		// If server options provided, prefer server-side deposit request
		if (opts.server) {
			if (!opts.authToken) {
				console.error(
					"Error: --auth-token is required when using --server",
				);
				process.exit(1);
			}
			if (!opts.pin) {
				console.error(
					"Error: --pin is required when using --server to confirm user's PIN",
				);
				process.exit(1);
			}
			if (!opts.amount) {
				console.error(
					"Error: --amount is required when using --server to request a deposit",
				);
				process.exit(1);
			}
			try {
				const url = opts.server.replace(/\/$/, "") + "/api/tokens/generate";
				const res = await axios.post(
					url,
					{ amount: Number(opts.amount), pin: opts.pin },
					{
						headers: { Authorization: `Bearer ${opts.authToken}` },
						withCredentials: true,
					},
				);
				console.log("=========================================");
				console.log(res.data.message || "Deposit request created (server)");
				console.log("=========================================");
				return;
			} catch (err: any) {
				console.error(
					"Server request failed:",
					err.response?.data?.message || err.message,
				);
				process.exit(1);
			}
		}

		// Local (CLI) mode: require MongoDB connection
		if (!process.env.MONGO_URI) {
			console.error(
				"Error: MONGO_URI must be set for local CLI mode (no db.json fallback anymore).",
			);
			process.exit(1);
		}

		try {
			await connectMongo();
			const customer = (await customerStore.findByEmailOrId(
				opts.customer,
			)) as any;
			if (!customer) {
				console.error("Error: Customer not found:", opts.customer);
				process.exit(1);
			}

			if ((customer.balance || 0) < REQUIRED_BALANCE) {
				console.error(
					`Error: Customer balance ($${((customer.balance || 0) / 100).toFixed(2)}) is below the required $50,000.00 threshold.`,
				);
				process.exit(1);
			}

			const activeTokens = (await tokenStore.findActiveByCustomerId(
				customer.id,
			)) as any[];
			if ((activeTokens || []).length >= 10) {
				console.error(
					"Error: Customer already has the maximum of 10 active tokens.",
				);
				process.exit(1);
			}

			const tokenRecord = (await tokenStore.create({
				customerId: customer.id,
			})) as any;
			console.log("=========================================");
			console.log("Token & PIN generated (MongoDB):");
			console.log(
				`PIN (4-Digit): ${tokenRecord.pin}  <-- USE THIS FOR CHECKOUT`,
			);
			console.log(`Token:        ${tokenRecord.token}`);
			console.log(`Owner:        ${customer.name} (${customer.email})`);
			console.log("=========================================");
			return;
		} catch (err: any) {
			console.error("MongoDB token generation failed:", err.message || err);
			process.exit(1);
		}
	});

cmd.command("list").action(async () => {
	const tokenStore = TokenStore.getInstance();
	const customerStore = CustomerStore.getInstance();
	try {
		await connectMongo();
		const tokens = (await tokenStore.all()) as any[];

		if (!tokens || tokens.length === 0) {
			console.log("No tokens or PINs generated yet.");
			return;
		}

		console.log("Generated Tokens & PINs:");
		for (const t of tokens) {
			const customer = (await customerStore.findByEmailOrId(
				t.customerId,
			)) as any;
			const ownerInfo = customer
				? `${customer.name} (${customer.email})`
				: t.customerId;
			console.log(
				`- PIN: ${t.pin} | Token: ${t.token} | Status: ${t.status} | Owner: ${ownerInfo} | Created: ${t.createdAt}`,
			);
		}
	} catch (err: any) {
		console.error("Failed to list tokens:", err.message || err);
		process.exit(1);
	}
});

export default cmd;
