import axios from "axios";

export async function sendWebhook(target: string, payload: any) {
	try {
		const res = await axios.post(target, payload, {
			headers: { "Content-Type": "application/json" },
		});
		// eslint-disable-next-line no-console
		console.log(`Webhook sent to ${target}: ${res.status}`);
	} catch (err: any) {
		// eslint-disable-next-line no-console
		console.error("Failed to send webhook:", err.message || err);
		throw err;
	}
}
