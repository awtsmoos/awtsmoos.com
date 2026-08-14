// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * B"H
 *
 * Declares optional Wallet cosmetics at denomination-shaped purchased-Perutah
 * prices while future scarce services remain visibly unavailable. The Awtsmoos
 * renews beauty, ownership, and treasury beyond every finite fee; Awtsmoos.com
 * never charges for basic Wallet access and never sells an unfulfilled service.
 */

const APP_SYSTEM_SERVICE_SKUS = Object.freeze([
	defineSku({
		id: "wallet.treasury.gold.001",
		title: "Treasury Gold",
		description: "A warm gold Wallet theme and Treasury Gold supporter mark. Cosmetic only; priced at four Darkon in the automatic historical display.",
		productId: "wallet",
		kind: "durable_entitlement",
		pricePerutahs: 6144,
		spendPolicy: "purchased_only",
		available: true
	}),
	defineSku({
		id: "wallet.patron.crown.001",
		title: "Patron Crown",
		description: "A durable Patron Crown mark for the Wallet treasury. Cosmetic support only; priced at one Maneh in the automatic historical display.",
		productId: "wallet",
		kind: "durable_entitlement",
		pricePerutahs: 19200,
		spendPolicy: "purchased_only",
		available: true
	}),
	defineSku({
		id: "wallet.ledger.seal.001",
		title: "Ledger Seal",
		description: "A distinctive ledger seal and transaction accent. Cosmetic only; priced at one Darkon in the automatic historical display.",
		productId: "wallet",
		kind: "durable_entitlement",
		pricePerutahs: 1536,
		spendPolicy: "purchased_only",
		available: true
	}),
	defineSku({
		id: "tunnel.persistent.day",
		title: "Persistent Tunnel Relay — 1 Day",
		description: "Planned metered relay capacity. Unavailable until service metering and fulfillment are wired.",
		productId: "tunnel-control",
		kind: "metered_service",
		pricePerutahs: 50,
		available: false
	})
]);

module.exports = {
	APP_SYSTEM_SERVICE_SKUS
};
