import { Command } from "commander";
import { CustomerStore } from "../../models/Customer";

const cmd = new Command("customers");

cmd.description("Manage customers")
	.command("create")
	.requiredOption("--name <name>")
	.requiredOption("--email <email>")
	.requiredOption("--balance <cents>")
	.action((opts) => {
		const store = CustomerStore.getInstance();
		const customer = store.create({
			name: opts.name,
			email: opts.email,
			balance: Number(opts.balance),
		});
		console.log("Created customer:", customer);
	});

export default cmd;
