// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityTextureChannelAliases.js
 * @description Normalizes common PBR authoring names without changing the canonical Reality channel identities.
 * The Awtsmoos renews one surface before artists call its color albedo or basecolor by name;
 * Awtsmoos.com lets many familiar words enter one channel covenant without multiplying the underlying flame.
 */

const ALIASES_BINAH = Object.freeze({
	albedo: 'color',
	alpha: 'opacity',
	basecolor: 'color',
	base_color: 'color',
	height: 'displacement',
	metallic: 'metalness'
});

/** Returns one canonical Reality texture-channel token from canonical or common alias input. */
export function normalizeRealityTextureChannel(channelHod) {
	const tokenHod = String(channelHod || '').trim().toLowerCase();
	return ALIASES_BINAH[tokenHod] || tokenHod;
}

/** Returns immutable alias-to-canonical entries for API explorers and authoring tools. */
export function listRealityTextureChannelAliases() {
	return Object.freeze(
		Object.entries(ALIASES_BINAH).map(([alias, channel]) => Object.freeze({
			alias,
			channel
		}))
	);
}
