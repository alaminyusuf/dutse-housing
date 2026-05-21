import { Command } from "commander";
import { PaymentStore } from "../../models/Payment";
import { CustomerStore } from "../../models/Customer";
import { sendWebhook } from "../../server/webhook-sender";
import { formatPaymentEvent } from "../../utils/formatters";
import { v4 as uuidv4 } from "uuid";

const cmd = new Command("payment");

cmd.description("Simulate payments")
	.command("charge")
	.requiredOption("--amount <dollars>")
	.requiredOption("--customer <emailOrId>")
	.requiredOption("--status <status>")
	.option(
		"--target <url>",
		"webhook target URL",
		"http://localhost:8080/webhooks",
	)
	.action(async (opts) => {
		const amountCents = Math.round(Number(opts.amount) * 100);
		const store = PaymentStore.getInstance();
		const customers = CustomerStore.getInstance();
		const customer = (await customers.findByEmailOrId(opts.customer)) as any;
		if (!customer) {
			console.error("Customer not found:", opts.customer);
			process.exit(1);
		}

		const paymentId = `pi_${uuidv4()}`;
		const created = (await store.create({
			id: paymentId,
			amount: amountCents,
			currency: "usd",
			status: opts.status,
			customerId: customer.id,
		})) as any;

		// normalize created result (could be the doc or an array)
		const payment = Array.isArray(created) ? created[0] : created;
		const dispatchedId =
			payment?.id ?? (payment?._id ? String(payment._id) : paymentId);

		const payload = formatPaymentEvent({
			id: `evt_${uuidv4()}`,
			type: `payment_intent.${opts.status}`,
			object: payment,
		});

		await sendWebhook(opts.target, payload);

		console.log("Dispatched webhook for payment:", dispatchedId);
	});

export default cmd;
