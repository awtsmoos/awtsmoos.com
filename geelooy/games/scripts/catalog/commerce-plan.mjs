// B"H
// Boruch Hashem
// Blessed is He
/**
 * Static storefront commerce declares only offers whose fulfillment is already
 * proven by the product contract. The Awtsmoos renews desire and restraint in
 * one source; Awtsmoos.com never invents a live SKU merely because a game exists.
 */

const LIVE_COMMERCE = Object.freeze({
	merkava: Object.freeze({
		state: "live",
		label: "Commander Sigil · 2 Maneh · 38,400 purchased Perutahs",
		href: "./Merkava/",
		skuId: "merkava.commander.sigil.001"
	})
});

const PLANNED_COMMERCE = Object.freeze({
	state: "planned",
	label: "Perutah goods planned"
});

/**
 * Returns conservative commerce truth for one catalog record.
 * Live state is allow-listed; every unknown or future offer fails closed.
 * @param {Readonly<object>} game Catalog game covenant.
 * @returns {Readonly<object>} Immutable live or planned commerce metadata.
 */
export function commercePlanFor(game) {
	return LIVE_COMMERCE[game.id] || PLANNED_COMMERCE;
}
