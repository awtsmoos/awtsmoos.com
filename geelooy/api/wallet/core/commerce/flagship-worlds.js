// B"H
// Boruch Hashem
// Blessed is He

const { defineSku } = require("./sku.js");

/**
 * B"H
 *
 * Planned durable goods for story, learning, and living-world Awtsmoos Originals.
 * Every SKU remains unavailable until the receiving world actually reads its
 * entitlement. The Awtsmoos renews story and vessel beyond price; Awtsmoos.com
 * records future commerce honestly without charging for a doorway not yet wired.
 */

const WORLD_SKUS = Object.freeze([
	defineSku({
		id: "seven-mitzvos.city.decor.001",
		title: "Covenant City Decor Set",
		description: "Planned durable city-decoration collection for Seven Mitzvos.",
		productId: "seven-mitzvos",
		entitlementKey: "seven-mitzvos.city.decor.001",
		pricePerutahs: 275,
		available: false
	}),
	defineSku({
		id: "city-of-light.pilgrim.theme.001",
		title: "City of Light Pilgrim Theme",
		description: "Planned durable pilgrim appearance and visual theme collection.",
		productId: "city-of-light",
		entitlementKey: "city-of-light.pilgrim.theme.001",
		pricePerutahs: 225,
		available: false
	}),
	defineSku({
		id: "ohr-hagnuz.frontier.decor.001",
		title: "Ohr HaGnuz Frontier Decor",
		description: "Planned durable home and frontier decoration collection.",
		productId: "ohr-hagnuz",
		entitlementKey: "ohr-hagnuz.frontier.decor.001",
		pricePerutahs: 325,
		available: false
	}),
	defineSku({
		id: "scribe-journey.quill.001",
		title: "Scribe's Journey Quill Collection",
		description: "Planned durable cosmetic quill and robe collection.",
		productId: "scribe-journey",
		entitlementKey: "scribe-journey.quill.001",
		pricePerutahs: 200,
		available: false
	}),
	defineSku({
		id: "mitzvah-world.home.decor.001",
		title: "Mitzvah World Home Decor",
		description: "Planned durable home-decoration collection for the living world.",
		productId: "mitzvah-world",
		entitlementKey: "mitzvah-world.home.decor.001",
		pricePerutahs: 350,
		available: false
	})
]);

module.exports = {
	WORLD_SKUS
};
