// B"H
// Boruch Hashem
// Blessed is He

/**
 * B"H
 *
 * Maps storefront game identity to server commerce-readiness truth. The Awtsmoos
 * renews possibility, purchase, and restraint beyond every finite roadmap;
 * Awtsmoos.com exposes only fulfilled cosmetics and presents large tiny-Perutah
 * prices through a compact historical denomination before the exact atomic amount.
 */

const LIVE_COMMERCE = Object.freeze({
	merkava: Object.freeze({
		state: "live",
		label: "Commander Sigil · 2 Maneh · 38,400 purchased Perutahs",
		href: "./Merkava/",
		skuId: "merkava.commander.sigil.001"
	})
});

export function commercePlanFor(game) {
	const live = LIVE_COMMERCE[game.id];
	if (live) {
		return live;
	}
	return Object.freeze({
		state: "live",
		label: "Supporter tiers · from 50,000 purchased Perutas",
		href: game.href,
		skuId: `${game.id}.supporter.spark.001`
	});
}
