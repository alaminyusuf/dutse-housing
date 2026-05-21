import Koa from "koa";
import Router from "@koa/router";
import bodyParser from "koa-bodyparser";
import { sendWebhook } from "./webhook-sender";
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
		const {
			pin,
			userId,
			propertyId,
			amount,
			sessionId: reqSessionId,
		} = (ctx.request as any).body;

		if (!pin || !userId || !propertyId || !amount) {
			ctx.status = 400;
			ctx.body = {
				error: "Missing required fields: pin, userId, propertyId, amount",
			};
			return;
		}

		const customerStore = CustomerStore.getInstance();
		const paymentStore = PaymentStore.getInstance();

		// Find customer directly by provided userId (token flow removed)
		const customer = (await customerStore.findByEmailOrId(userId)) as any;
		if (!customer) {
			ctx.status = 400;
			ctx.body = { error: "Customer not found" };
			return;
		}

		// 3. Verify balance (amount is in cents, customer balance is in cents)
		if ((customer.balance || 0) < amount) {
			ctx.status = 400;
			ctx.body = {
				error: `Insufficient balance. Required: $${(amount / 100).toFixed(2)}, Current: $${((customer.balance || 0) / 100).toFixed(2)}`,
			};
			return;
		}

		// 4. Process payment
		customer.balance -= amount;
		await customerStore.update(customer as any);

		const paymentId = `pi_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
		await paymentStore.create({
			id: paymentId,
			amount,
			currency: "usd",
			status: "succeeded",
			customerId: customer.id,
		} as any);

		// Use passed sessionId if present, otherwise generate new one
		const sessionId =
			reqSessionId ||
			`cs_test_${uuidv4().replace(/-/g, "").substring(0, 20)}`;

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
			console.error(
				"Failed to forward payment webhook:",
				err.message || err,
			);
		}

		// 6. Return standard Stripe-like checkout session response
		ctx.status = 200;
		ctx.body = {
			id: sessionId,
			url: `http://localhost:5173/success?session_id=${sessionId}`,
		};
	});

	/**
	 * Admin Route: Generate / Top-up simulated customer balances.
	 * @route POST /admin/generate-balance
	 * @body { email, balance } (balance in cents)
	 */
	router.post("/admin/generate-balance", async (ctx) => {
		const { email, balance } = (ctx.request as any).body;

		if (!email || balance === undefined || isNaN(Number(balance))) {
			ctx.status = 400;
			ctx.body = { error: "Missing or invalid email or balance" };
			return;
		}

		const customerStore = CustomerStore.getInstance();
		const balanceCents = Math.round(Number(balance));

		// Find or create customer (async store)
		let customer = (await customerStore.findByEmailOrId(email)) as any;
		if (customer) {
			customer.balance = (customer.balance || 0) + balanceCents;
			await customerStore.update(customer as any);
		} else {
			// Extract a friendly name from email prefix
			const prefix = email.split("@")[0];
			const friendlyName = prefix.charAt(0).toUpperCase() + prefix.slice(1);

			customer = (await customerStore.create({
				name: friendlyName,
				email,
				balance: balanceCents,
			})) as any;
		}

		ctx.status = 200;
		ctx.body = {
			message: "Balance generated successfully",
			customer: {
				id: customer!.id,
				name: customer!.name,
				email: customer!.email,
				balance: customer!.balance,
			},
		};
	});

	app.use(router.routes());
	app.use(router.allowedMethods());

	return app;
}
