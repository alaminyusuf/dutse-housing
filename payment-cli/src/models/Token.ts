import { readDb, writeDb } from "../utils/db";
import { v4 as uuidv4 } from "uuid";

export type TokenRecord = {
	token: string;
	customerId: string;
	status: "unused" | "used";
	createdAt: string;
	pin: string;
};

class TokenStoreClass {
	create(data: { customerId: string }) {
		const db = readDb();

		// Generate a unique 4-digit PIN among all active (unused) tokens
		let pin = "";
		let isUnique = false;
		while (!isUnique) {
			pin = Math.floor(1000 + Math.random() * 9000).toString();
			const exists = db.tokens.some((t) => t.pin === pin && t.status === "unused");
			if (!exists) {
				isUnique = true;
			}
		}

		const t: TokenRecord = {
			token: `tok_${uuidv4().replace(/-/g, "").substring(0, 16)}`,
			customerId: data.customerId,
			status: "unused",
			createdAt: new Date().toISOString(),
			pin,
		};
		db.tokens.push(t);
		writeDb(db);
		return t;
	}

	findByToken(token: string) {
		const db = readDb();
		return db.tokens.find((t) => t.token === token);
	}

	findByPin(pin: string) {
		const db = readDb();
		return db.tokens.find((t) => t.pin === pin && t.status === "unused");
	}

	findActiveByCustomerId(customerId: string) {
		const db = readDb();
		return db.tokens.filter((t) => t.customerId === customerId && t.status === "unused");
	}

	findAllByCustomerId(customerId: string) {
		const db = readDb();
		return db.tokens.filter((t) => t.customerId === customerId);
	}

	all() {
		const db = readDb();
		return db.tokens.slice();
	}

	update(token: TokenRecord) {
		const db = readDb();
		const idx = db.tokens.findIndex((t) => t.token === token.token);
		if (idx !== -1) {
			db.tokens[idx] = token;
			writeDb(db);
		}
	}
}

export const TokenStore = new (class {
	private instance: TokenStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new TokenStoreClass();
		return this.instance;
	}
})();
