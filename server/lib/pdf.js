const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

async function generateCertificate({ orderId, user, property }) {
	return new Promise((resolve, reject) => {
		try {
			const outDir = path.join(process.cwd(), "storage", "pdfs");
			if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
			const filename = `certificate_${orderId}.pdf`;
			const filePath = path.join(outDir, filename);
			const doc = new PDFDocument({ size: "A4" });
			const stream = fs.createWriteStream(filePath);
			doc.pipe(stream);

			doc.fontSize(20).text("Certificate of Purchase", { align: "center" });
			doc.moveDown(2);
			doc.fontSize(14).text(
				`This certifies that ${user.name} has purchased:`,
				{ align: "left" },
			);
			doc.moveDown();
			doc.fontSize(12).text(`House Number: ${property.houseNumber}`);
			doc.text(`Property: ${property.title}`);
			doc.text(`Location: ${property.location}`);
			doc.text(`Amount: $${property.price}`);
			doc.moveDown(2);
			doc.text(`Order ID: ${orderId}`);
			doc.moveDown(4);
			doc.text("Thank you for your purchase.", { align: "center" });

			doc.end();
			stream.on("finish", () => resolve(filePath));
			stream.on("error", (err) => reject(err));
		} catch (err) {
			reject(err);
		}
	});
}

module.exports = { generateCertificate };
