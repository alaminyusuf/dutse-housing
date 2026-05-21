import { connectMongo, mongoose } from "../utils/db";
import { v4 as uuidv4 } from "uuid";

export type TokenRecord = {
	token: string;
	customerId: string;
	status: "string";
	createdAt: Date;
	pin: string;
};

const schema = new mongoose.Schema(
	{
		token: String,
		customerId: String,
		status: { type: String, default: "unused" },
		createdAt: Date,
		pin: String,
	},
	{ collection: "cli_tokens" },
);

let TokenModel: mongoose.Model<any>;

class TokenStoreClass {
	async ensure() {
		if (!TokenModel) {
			await connectMongo();
			TokenModel =
				mongoose.models.CliToken || mongoose.model("CliToken", schema);
		}
	}

	async create(data: { customerId: string }) {
		await this.ensure();
		// generate unique 4-digit pin among unused
		let pin = "";
		while (true) {
			pin = Math.floor(1000 + Math.random() * 9000).toString();
			const exists = await TokenModel.findOne({
				pin,
				status: "unused",
			}).lean();
			if (!exists) break;
		}
		const token = `tok_${uuidv4().replace(/-/g, "").substring(0, 16)}`;
		const doc = await TokenModel.create({
			token,
			customerId: data.customerId,
			pin,
			status: "unused",
			createdAt: new Date(),
		});
		return doc.toObject();
	}

	async findByToken(token: string) {
		await this.ensure();
		return TokenModel.findOne({ token }).lean();
	}

	async findByPin(pin: string) {
		await this.ensure();
		return TokenModel.findOne({ pin, status: "unused" }).lean();
	}

	async findActiveByCustomerId(customerId: string) {
		await this.ensure();
		return TokenModel.find({ customerId, status: "unused" }).lean();
	}

	async findAllByCustomerId(customerId: string) {
		await this.ensure();
		return TokenModel.find({ customerId }).lean();
	}

	async all() {
		await this.ensure();
		return TokenModel.find().lean();
	}

	async update(tokenRec: TokenRecord) {
		await this.ensure();
		await TokenModel.updateOne({ token: tokenRec.token }, { $set: tokenRec });
	}
}

export const TokenStore = new (class {
	private instance: TokenStoreClass | null = null;
	getInstance() {
		if (!this.instance) this.instance = new TokenStoreClass();
		return this.instance;
	}
})();
