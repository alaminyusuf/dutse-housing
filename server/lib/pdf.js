/**
 * Generates a premium horizontal landscape PDF certificate of ownership for a completed purchase.
 *
 * @module lib/pdf
 */
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generates an elegant landcape ownership certificate.
 * @param {Object} params
 * @param {string} params.orderId - Order ID
 * @param {Object} params.user - Mongoose User record
 * @param {Object} params.property - Mongoose Property record
 * @returns {Promise<string>} File path to generated PDF asset
 */
async function generateCertificate({ orderId, user, property }) {
	return new Promise((resolve, reject) => {
		try {
			const outDir = path.join(process.cwd(), "storage", "pdfs");
			if (!fs.existsSync(outDir)) {
				fs.mkdirSync(outDir, { recursive: true });
			}
			const filename = `certificate_${orderId}.pdf`;
			const filePath = path.join(outDir, filename);

			// Initialize document in landscape layout
			const doc = new PDFDocument({
				size: "A4",
				layout: "landscape",
				margins: { top: 0, bottom: 0, left: 0, right: 0 }
			});

			const stream = fs.createWriteStream(filePath);
			doc.pipe(stream);

			// A4 Landscape dimensions: width = 841.89 points, height = 595.28 points
			const pageWidth = 842;
			const pageHeight = 595;

			// 1. Draw elegant outer thick border (linewidth 3)
			doc.rect(30, 30, pageWidth - 60, pageHeight - 60)
				.lineWidth(3)
				.strokeColor("#1a1a1a")
				.stroke();

			// 2. Draw outer thin border (linewidth 1)
			doc.rect(36, 36, pageWidth - 72, pageHeight - 72)
				.lineWidth(1)
				.strokeColor("#1a1a1a")
				.stroke();

			// 3. Title: "Certificate of Ownership"
			doc.moveDown(4);
			doc.font("Times-BoldItalic")
				.fontSize(38)
				.fillColor("#1a1a1a")
				.text("Certificate of Ownership", { align: "center" });

			// 4. "This is to certify that"
			doc.moveDown(1.5);
			doc.font("Times-Roman")
				.fontSize(14)
				.fillColor("#4a4a4a")
				.text("This is to certify that", { align: "center" });

			// 5. User name
			doc.moveDown(1.2);
			const displayName = (user.name || "Valued Customer").toUpperCase();
			doc.font("Times-Bold")
				.fontSize(22)
				.fillColor("#1a1a1a")
				.text(displayName, { align: "center" });

			// Thin line under buyer name
			doc.moveTo(220, 205)
				.lineTo(pageWidth - 220, 205)
				.lineWidth(0.8)
				.strokeColor("#a0a0a0")
				.stroke();

			// 6. "Is the legal owner of"
			doc.moveDown(1.8);
			doc.font("Times-Roman")
				.fontSize(14)
				.fillColor("#4a4a4a")
				.text("Is the legal owner of", { align: "center" });

			// 7. Property details
			doc.moveDown(1.2);
			const displayProperty = `${property.title} (House: ${property.houseNumber})`;
			doc.font("Times-Bold")
				.fontSize(18)
				.fillColor("#1a1a1a")
				.text(displayProperty, { align: "center" });

			// Thin line under property description
			doc.moveTo(180, 280)
				.lineTo(pageWidth - 180, 280)
				.lineWidth(0.8)
				.strokeColor("#a0a0a0")
				.stroke();

			// 8. Date details (e.g. Day, Month, Year)
			const dateObj = new Date();
			const day = dateObj.getDate();
			const monthName = dateObj.toLocaleString("en-US", { month: "long" });
			const year = dateObj.getFullYear();

			// Standard Ordinal Suffix helper (e.g. 1st, 2nd, 3rd, 4th)
			const getOrdinal = (n) => {
				const s = ["th", "st", "nd", "rd"];
				const v = n % 100;
				return n + (s[(v - 20) % 10] || s[v] || s[0]);
			};
			const displayDay = getOrdinal(day);

			doc.moveDown(2);
			doc.font("Times-Roman")
				.fontSize(14)
				.fillColor("#4a4a4a")
				.text(`On this    ${displayDay}    Day of    ${monthName}    In the Year    ${year}`, { align: "center" });

			// 9. Location details
			doc.moveDown(1.5);
			const displayLocation = `At:   ${property.location}`;
			doc.font("Times-Roman")
				.fontSize(14)
				.fillColor("#1a1a1a")
				.text(displayLocation, { align: "center" });

			// Thin line under location
			doc.moveTo(250, 390)
				.lineTo(pageWidth - 250, 390)
				.lineWidth(0.8)
				.strokeColor("#a0a0a0")
				.stroke();

			// 10. Signature block
			doc.moveDown(3);
			doc.font("Times-BoldItalic")
				.fontSize(14)
				.fillColor("#1a1a1a")
				.text("Signed, Dutse Housing Registry Authority", { align: "center" });

			// Signature Line
			doc.moveTo(280, 480)
				.lineTo(pageWidth - 280, 480)
				.lineWidth(1)
				.strokeColor("#1a1a1a")
				.stroke();

			// 11. Registry ID / Reference in footer
			doc.font("Courier")
				.fontSize(7.5)
				.fillColor("#888888")
				.text(`Reference Transaction ID: ${orderId}`, 50, pageHeight - 50);

			doc.end();
			stream.on("finish", () => resolve(filePath));
			stream.on("error", (err) => reject(err));
		} catch (err) {
			reject(err);
		}
	});
}

module.exports = { generateCertificate };
