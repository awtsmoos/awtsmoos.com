//B"H
//Boruch Hashem
//Blessed be He

const { usdToPerutahs } = require("../currency.js");
const { defineSku } = require("./sku.js");

/**
 * @module FoundingServiceCatalog
 * @description
 * Server-authoritative one-time reservations for founder-assisted Awtsmoos builds.
 * These are deposits toward separately confirmed project scopes, not subscriptions,
 * delivery-time guarantees, or promises that unfinished cloud primitives already exist.
 */

const FOUNDING_SERVICE_DEFINITIONS = Object.freeze([
	Object.freeze({
		code: "launch",
		dollars: 199,
		title: "Awtsmoos Launch · Founding Build Reservation"
	}),
	Object.freeze({
		code: "business",
		dollars: 249,
		title: "Awtsmoos Business System · Founding Build Reservation"
	}),
	Object.freeze({
		code: "agency",
		dollars: 249,
		title: "Awtsmoos Agency Cloud · Founding Build Reservation"
	})
]);
/**
 * Turns one honest human service offer into an atomic durable commerce SKU.
 * @param {{code:string,dollars:number,title:string}} definition Founding offer.
 * @returns {Readonly<object>} Server-known purchasable reservation SKU.
 */
function createFoundingServiceSku(definition) {
	return defineSku({
		id: `drive.service.${definition.code}.reservation.001`,
		title: definition.title,
		description: [
			"One-time founder-assisted build reservation credited toward a separately confirmed project scope.",
			"Remaining price, timeline, deliverables, and any recurring hosting are confirmed separately before that work begins."
		].join(" "),
		productId: "drive",
		kind: "durable_entitlement",
		pricePerutahs: usdToPerutahs(definition.dollars),
		spendPolicy: "purchased_only",
		available: true
	});
}

const FOUNDING_SERVICE_SKUS = Object.freeze(
	FOUNDING_SERVICE_DEFINITIONS.map(createFoundingServiceSku)
);

module.exports = {
	FOUNDING_SERVICE_DEFINITIONS,
	FOUNDING_SERVICE_SKUS,
	createFoundingServiceSku
};