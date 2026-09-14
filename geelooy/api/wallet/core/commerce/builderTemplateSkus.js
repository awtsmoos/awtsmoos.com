//B"H
//Boruch Hashem
//Blessed be He

const { defineSku } = require("./sku.js");

/**
 * @module BuilderTemplateSkus
 * @description Server-authoritative prices for real Geelooy Sites source templates.
 */

const BUNDLE_SKU_ID = "drive.template.propack.001";
const DEFINITIONS = Object.freeze([
	Object.freeze({ id: "launch-pro", skuId: "drive.template.launch.001", title: "Launch Pro", pricePerutahs: 1000000 }),
	Object.freeze({ id: "agency-pro", skuId: "drive.template.agency.001", title: "Agency Pro", pricePerutahs: 1000000 }),
	Object.freeze({ id: "saas-pro", skuId: "drive.template.saas.001", title: "SaaS Pro", pricePerutahs: 1000000 })
]);

const BUILDER_TEMPLATE_SKUS = Object.freeze([
	...DEFINITIONS.map(item => defineSku({
		id: item.skuId,
		title: `Geelooy Sites · ${item.title} Template`,
		description: "Unlock a polished, fully editable HTML/CSS/JS website starter with no external libraries.",
		productId: "drive",
		kind: "durable_entitlement",
		pricePerutahs: item.pricePerutahs,
		spendPolicy: "purchased_only",
		available: true
	})),
	defineSku({
		id: BUNDLE_SKU_ID,
		title: "Geelooy Sites · Pro Template Pack",
		description: "Unlock Launch Pro, Agency Pro, and SaaS Pro together as editable source.",
		productId: "drive",
		kind: "durable_entitlement",
		pricePerutahs: 2500000,
		spendPolicy: "purchased_only",
		available: true
	})
]);

function templateSku(starterId) {
	return DEFINITIONS.find(item => item.id === String(starterId || "")) || null;
}

module.exports = { BUNDLE_SKU_ID, BUILDER_TEMPLATE_SKUS, DEFINITIONS, templateSku };
