import fs from "fs";
import path from "path";

// Resolves to payment-cli/db.json both in src/ (ts-node-dev) and dist/ (compiled)
const DB_FILE = path.join(__dirname, "../../db.json");

export type DbData = {
	customers: any[];
	payments: any[];
	tokens: any[];
};

export function readDb(): DbData {
	if (!fs.existsSync(DB_FILE)) {
		const initial: DbData = { customers: [], payments: [], tokens: [] };
		fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
		return initial;
	}
	try {
		const content = fs.readFileSync(DB_FILE, "utf8");
		return JSON.parse(content);
	} catch (err) {
		return { customers: [], payments: [], tokens: [] };
	}
}

export function writeDb(data: DbData): void {
	fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
}
