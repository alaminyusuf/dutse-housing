import { Command } from "commander";
import { createServer } from "../../server/app";

const cmd = new Command("start");

cmd.description("Start the webhook simulator server")
	.option("-p, --port <number>", "port to run the server on", "3000")
	.option(
		"-t, --target <url>",
		"target webhook URL to forward events to",
		"http://localhost:5000/api/webhook",
	)
	.option("--db <path>", "sqlite database path (optional)")
	.action((opts) => {
		const port = Number(opts.port || 3000);
		const target = opts.target;

		const app = createServer({ port, target, dbPath: opts.db });

		app.listen(port, () => {
			console.log(`webhook-pay-sim listening on http://localhost:${port}`);
			console.log(`Forwarding events to: ${target}`);
		});
	});

export default cmd;
