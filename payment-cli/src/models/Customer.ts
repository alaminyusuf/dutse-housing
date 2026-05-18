import { v4 as uuidv4 } from "uuid";

export type CustomerRecord = {
	id: string;
	name: string;
	email: string;
	balance: number; // in cents
};

class CustomerStoreClass {
	private customers: CustomerRecord[] = [];

	create(data: { name: string; email: string; balance: number }) {
		const c: CustomerRecord = {
			id: `cus_${uuidv4()}`,
			name: data.name,
			email: data.email,
			balance: data.balance,
		};
		this.customers.push(c);
		return c;
	}

	findByEmailOrId(key: string) {
		return this.customers.find((c) => c.email === key || c.id === key);
	}

	all() {
		return this.customers.slice();
	}
}

export const CustomerStore = new (class {
	private instance: CustomerStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new CustomerStoreClass();
		return this.instance;
	}
})();
