import { Command } from "commander";
import startCommand from "./commands/start";
import customersCommand from "./commands/customers";
import paymentsCommand from "./commands/payments";

export function runCli() {
	const program = new Command();
	program.name("webhook-pay-sim");
	program.version("0.1.0");

	program.addCommand(startCommand);
	program.addCommand(customersCommand);
	program.addCommand(paymentsCommand);

	program.parse(process.argv);
}
