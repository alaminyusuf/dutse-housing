import { connectMongo, mongoose } from "../utils/db";

export type CustomerRecord = {
	id: string;
	name: string;
	email: string;
	balance: number; // in cents
};

const schema = new mongoose.Schema(
	{
		id: String,
		name: String,
		email: String,
		balance: Number,
	},
	{ collection: "customers" },
);

let CustomerModel: mongoose.Model<any>;

class CustomerStoreClass {
	async ensure() {
		if (!CustomerModel) {
			await connectMongo();
			CustomerModel =
				mongoose.models.PaymentCustomer ||
				mongoose.model("PaymentCustomer", schema);
		}
	}

	async create(data: { name: string; email: string; balance: number }) {
		await this.ensure();
		const id = `cus_${new mongoose.Types.ObjectId().toString()}`;
		const doc = await CustomerModel.create({
			id,
			name: data.name,
			email: data.email,
			balance: data.balance,
		});
		return doc.toObject();
	}

	async findByEmailOrId(key: string) {
		await this.ensure();
		const doc = await CustomerModel.findOne({
			$or: [{ email: key }, { id: key }],
		}).lean();
		return doc;
	}

	async all() {
		await this.ensure();
		return CustomerModel.find().lean();
	}

	async update(customer: CustomerRecord) {
		await this.ensure();
		await CustomerModel.updateOne(
			{ id: customer.id },
			{ $set: { ...customer } },
		);
	}
}

export const CustomerStore = new (class {
	private instance: CustomerStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new CustomerStoreClass();
		return this.instance;
	}
})();
