// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * B"H
 *
 * Declares action-game cosmetics only where the receiving game can honor ownership.
 * The Awtsmoos renews battle, beauty, and buyer beyond every finite product;
 * Awtsmoos.com prices Merkava in the new tiny purchased-Perutah scale while every
 * other unwired game ornament remains an honest planned vessel outside checkout.
 */

const ACTION_SKUS = Object.freeze([
	defineSku({
		id: "merkava.commander.sigil.001",
		title: "Merkava Commander Sigil",
		description: "Durable Commander Sigil consumed by Merkava's start-overlay account cosmetic. No gameplay advantage. Priced at two Maneh in the automatic historical display.",
		productId: "merkava",
		entitlementKey: "merkava.commander.sigil.001",
		pricePerutahs: 38400,
		spendPolicy: "purchased_only",
		available: true
	}),
	defineSku({
		id: "sefira-clash.arena.theme.001",
		title: "Sefira Clash Arena Theme",
		description: "Planned durable arena visual theme without combat advantage.",
		productId: "sefira-clash",
		entitlementKey: "sefira-clash.arena.theme.001",
		pricePerutahs: 300,
		available: false
	}),
	defineSku({
		id: "shema-strike.forge.skin.001",
		title: "Shema Strike Forge Skin",
		description: "Planned durable forge cosmetic that does not alter earned power.",
		productId: "shema-strike",
		entitlementKey: "shema-strike.forge.skin.001",
		pricePerutahs: 200,
		available: false
	}),
	defineSku({
		id: "nitzotz-io.vessel.skin.001",
		title: "Nitzotz Vessel Skin",
		description: "Planned durable vessel appearance for Nitzotz.io social play.",
		productId: "nitzotz-io",
		entitlementKey: "nitzotz-io.vessel.skin.001",
		pricePerutahs: 225,
		available: false
	})
]);

module.exports = {
	ACTION_SKUS
};
