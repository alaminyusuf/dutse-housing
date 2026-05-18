import { readDb, writeDb } from "../utils/db";

export type PaymentRecord = {
	id: string;
	amount: number; // cents
	currency: string;
	status: string;
	customerId: string;
};

class PaymentStoreClass {
	create(data: PaymentRecord) {
		const db = readDb();
		db.payments.push(data);
		writeDb(db);
		return data;
	}

	findById(id: string) {
		const db = readDb();
		return db.payments.find((p) => p.id === id);
	}

	all() {
		const db = readDb();
		return db.payments.slice();
	}
}

export const PaymentStore = new (class {
	private instance: PaymentStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new PaymentStoreClass();
		return this.instance;
	}
})();
