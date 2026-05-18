import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import { sendWebhook } from "./webhook-sender";

export function createServer({
	port = 3000,
	target = "http://localhost:8080/webhooks",
	dbPath,
}: {
	port?: number;
	target?: string;
	dbPath?: string | undefined;
}) {
	const app = new Koa();
	const router = new Router();

	app.use(bodyParser());

	router.post("/webhook", async (ctx) => {
		const event = (ctx.request as any).body;
		// Forward the event to the configured target
		try {
			await sendWebhook(target, event);
			ctx.status = 200;
			ctx.body = { forwarded: true };
		} catch (err) {
			ctx.status = 500;
			ctx.body = { error: "failed to forward" };
		}
	});

	app.use(router.routes());
	app.use(router.allowedMethods());

	return app;
}
