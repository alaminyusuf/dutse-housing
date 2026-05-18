export type PaymentRecord = {
	id: string;
	amount: number; // cents
	currency: string;
	status: string;
	customerId: string;
};

class PaymentStoreClass {
	private payments: PaymentRecord[] = [];

	create(data: PaymentRecord) {
		this.payments.push(data);
		return data;
	}

	findById(id: string) {
		return this.payments.find((p) => p.id === id);
	}

	all() {
		return this.payments.slice();
	}
}

export const PaymentStore = new (class {
	private instance: PaymentStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new PaymentStoreClass();
		return this.instance;
	}
})();
