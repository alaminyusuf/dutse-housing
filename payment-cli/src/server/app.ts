import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import { sendWebhook } from "./webhook-sender";
import { TokenStore } from "../models/Token";
import { CustomerStore } from "../models/Customer";
import { PaymentStore } from "../models/Payment";
import { v4 as uuidv4 } from "uuid";

export function createServer({
	port = 3000,
	target = "http://localhost:5000/api/webhook",
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
		try {
			await sendWebhook(target, event);
			ctx.status = 200;
			ctx.body = { forwarded: true };
		} catch (err) {
			ctx.status = 500;
			ctx.body = { error: "failed to forward" };
		}
	});

	router.post("/checkout/create-session", async (ctx) => {
		const { token, userId, propertyId, amount } = (ctx.request as any).body;

		if (!token || !userId || !propertyId || !amount) {
			ctx.status = 400;
			ctx.body = { error: "Missing required fields: token, userId, propertyId, amount" };
			return;
		}

		const tokenStore = TokenStore.getInstance();
		const customerStore = CustomerStore.getInstance();
		const paymentStore = PaymentStore.getInstance();

		// 1. Find token
		const tokenRecord = tokenStore.findByToken(token);
		if (!tokenRecord) {
			ctx.status = 400;
			ctx.body = { error: "Invalid payment token" };
			return;
		}

		if (tokenRecord.status !== "unused") {
			ctx.status = 400;
			ctx.body = { error: "Payment token has already been used" };
			return;
		}

		// 2. Find customer
		const customer = customerStore.findByEmailOrId(tokenRecord.customerId);
		if (!customer) {
			ctx.status = 400;
			ctx.body = { error: "Customer not found for this token" };
			return;
		}

		// 3. Verify balance (amount is in cents, customer balance is in cents)
		if (customer.balance < amount) {
			ctx.status = 400;
			ctx.body = {
				error: `Insufficient balance. Required: $${(amount / 100).toFixed(2)}, Current: $${(customer.balance / 100).toFixed(2)}`
			};
			return;
		}

		// 4. Process payment
		customer.balance -= amount;
		customerStore.update(customer);

		tokenRecord.status = "used";
		tokenStore.update(tokenRecord);

		const paymentId = `pi_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
		paymentStore.create({
			id: paymentId,
			amount,
			currency: "usd",
			status: "succeeded",
			customerId: customer.id,
		});

		const sessionId = `cs_test_${uuidv4().replace(/-/g, "").substring(0, 20)}`;

		// 5. Build and fire webhook event
		const webhookPayload = {
			id: `evt_${uuidv4().replace(/-/g, "").substring(0, 16)}`,
			type: "checkout.session.completed",
			data: {
				object: {
					id: sessionId,
					object: "checkout.session",
					status: "complete",
					metadata: {
						userId,
						propertyId,
					},
				},
			},
		};

		try {
			// Send webhook to Express server
			await sendWebhook(target, webhookPayload);
		} catch (err: any) {
			// Log webhook send failure but don't fail checkout since charge succeeded
			console.error("Failed to forward payment webhook:", err.message || err);
		}

		// 6. Return standard Stripe-like checkout session response
		ctx.status = 200;
		ctx.body = {
			id: sessionId,
			url: `http://localhost:5173/success?session_id=${sessionId}`,
		};
	});

	app.use(router.routes());
	app.use(router.allowedMethods());

	return app;
}
