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

const PLANNED_COMMERCE_GAMES = new Set([
	"sefira-clash",
	"nitzotz-io",
	"shema-strike",
	"seven-mitzvos",
	"city-of-light",
	"ohr-hagnuz",
	"scribe-journey",
	"mitzvah-world"
]);

export function commercePlanFor(game) {
	const live = LIVE_COMMERCE[game.id];
	if (live) {
		return live;
	}
	if (PLANNED_COMMERCE_GAMES.has(game.id)) {
		return Object.freeze({
			state: "planned",
			label: "Perutah goods planned",
			href: "",
			skuId: ""
		});
	}
	return Object.freeze({
		state: "none",
		label: "",
		href: "",
		skuId: ""
	});
}
