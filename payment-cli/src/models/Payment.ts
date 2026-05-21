import { connectMongo, mongoose } from "../utils/db";

export type PaymentRecord = {
	id: string;
	amount: number; // cents
	currency: string;
	status: string;
	customerId: string;
};

const schema = new mongoose.Schema(
	{
		id: String,
		amount: Number,
		currency: String,
		status: String,
		customerId: String,
	},
	{ collection: "payments" },
);

let PaymentModel: mongoose.Model<any>;

class PaymentStoreClass {
	async ensure() {
		if (!PaymentModel) {
			await connectMongo();
			PaymentModel =
				mongoose.models.CliPayment || mongoose.model("CliPayment", schema);
		}
	}

	async create(data: PaymentRecord) {
		await this.ensure();
		const doc = await PaymentModel.create(data);
		return doc.toObject();
	}

	async findById(id: string) {
		await this.ensure();
		return PaymentModel.findOne({ id }).lean();
	}

	async all() {
		await this.ensure();
		return PaymentModel.find().lean();
	}
}

export const PaymentStore = new (class {
	private instance: PaymentStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new PaymentStoreClass();
		return this.instance;
	}
})();
