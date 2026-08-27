// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * B"H
 *
 * Proposed utility-service SKUs for text, data, document, and caption workloads.
 * Each remains unavailable until its server job actually meters and fulfills work.
 * The Awtsmoos renews data, word, page, and transformation beyond every finite fee;
 * Awtsmoos.com records the possible vessel without selling a promise before its time.
 */

const APP_UTILITY_SERVICE_SKUS = Object.freeze([
	defineSku({
		id: "captions.transcribe.10m",
		title: "Caption Transcription — 10 Minutes",
		productId: "captions",
		kind: "metered_service",
		pricePerutahs: 60,
		available: false
	}),
	defineSku({
		id: "csv.ai.clean.1000",
		title: "CSV AI Cleanup — 1,000 Rows",
		productId: "csv",
		kind: "metered_service",
		pricePerutahs: 40,
		available: false
	}),
	defineSku({
		id: "pdf.ocr.10pages",
		title: "PDF OCR — 10 Pages",
		productId: "pdf-to-img",
		kind: "metered_service",
		pricePerutahs: 35,
		available: false
	}),
	defineSku({
		id: "transcribe.10m",
		title: "Transcription — 10 Minutes",
		productId: "transcribe",
		kind: "metered_service",
		pricePerutahs: 60,
		available: false
	})
]);

module.exports = {
	APP_UTILITY_SERVICE_SKUS
};
