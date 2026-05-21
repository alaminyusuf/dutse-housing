import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

let _connected = false;

export async function connectMongo() {
	const uri = process.env.MONGO_URI;
	if (!uri) throw new Error("MONGO_URI not set");
	if (_connected) return mongoose;
	await mongoose.connect(uri, { dbName: process.env.MONGO_DB || undefined });
	_connected = true;
	return mongoose;
}

export { mongoose };
