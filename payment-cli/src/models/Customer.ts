import { v4 as uuidv4 } from "uuid";
import { readDb, writeDb } from "../utils/db";

export type CustomerRecord = {
	id: string;
	name: string;
	email: string;
	balance: number; // in cents
};

class CustomerStoreClass {
	create(data: { name: string; email: string; balance: number }) {
		const db = readDb();
		const c: CustomerRecord = {
			id: `cus_${uuidv4()}`,
			name: data.name,
			email: data.email,
			balance: data.balance,
		};
		db.customers.push(c);
		writeDb(db);
		return c;
	}

	findByEmailOrId(key: string) {
		const db = readDb();
		return db.customers.find((c) => c.email === key || c.id === key);
	}

	all() {
		const db = readDb();
		return db.customers.slice();
	}

	update(customer: CustomerRecord) {
		const db = readDb();
		const idx = db.customers.findIndex((c) => c.id === customer.id);
		if (idx !== -1) {
			db.customers[idx] = customer;
			writeDb(db);
		}
	}
}

export const CustomerStore = new (class {
	private instance: CustomerStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new CustomerStoreClass();
		return this.instance;
	}
})();
