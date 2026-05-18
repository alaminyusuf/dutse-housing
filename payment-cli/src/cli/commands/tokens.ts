import { Command } from "commander";
import { CustomerStore } from "../../models/Customer";
import { TokenStore } from "../../models/Token";

const cmd = new Command("tokens");

cmd.description("Manage customer payment tokens and PINs")
	.command("generate")
	.requiredOption("--customer <emailOrId>")
	.action((opts) => {
		const customerStore = CustomerStore.getInstance();
		const tokenStore = TokenStore.getInstance();

		const customer = customerStore.findByEmailOrId(opts.customer);
		if (!customer) {
			console.error("Error: Customer not found:", opts.customer);
			process.exit(1);
		}

		// Enforce balance of at least $100,000.00 (10,000,000 cents)
		const REQUIRED_BALANCE = 10000000;
		if (customer.balance < REQUIRED_BALANCE) {
			console.error(
				`Error: Customer balance ($${(customer.balance / 100).toFixed(2)}) is below the required $100,000.00 threshold.`
			);
			process.exit(1);
		}

		// Enforce a maximum of 10 active (unused) tokens
		const activeTokens = tokenStore.findActiveByCustomerId(customer.id);
		if (activeTokens.length >= 10) {
			console.error("Error: Customer already has the maximum of 10 active tokens.");
			process.exit(1);
		}

		const tokenRecord = tokenStore.create({ customerId: customer.id });
		console.log("=========================================");
		console.log("Token & PIN generated successfully!");
		console.log(`PIN (4-Digit): ${tokenRecord.pin}  <-- USE THIS FOR CHECKOUT`);
		console.log(`Token:        ${tokenRecord.token}`);
		console.log(`Owner:        ${customer.name} (${customer.email})`);
		console.log("=========================================");
	});

cmd.command("list")
	.action(() => {
		const tokenStore = TokenStore.getInstance();
		const customerStore = CustomerStore.getInstance();
		const tokens = tokenStore.all();

		if (tokens.length === 0) {
			console.log("No tokens or PINs generated yet.");
			return;
		}

		console.log("Generated Tokens & PINs:");
		tokens.forEach((t) => {
			const customer = customerStore.findByEmailOrId(t.customerId);
			const ownerInfo = customer ? `${customer.name} (${customer.email})` : t.customerId;
			console.log(`- PIN: ${t.pin} | Token: ${t.token} | Status: ${t.status} | Owner: ${ownerInfo} | Created: ${t.createdAt}`);
		});
	});

export default cmd;
