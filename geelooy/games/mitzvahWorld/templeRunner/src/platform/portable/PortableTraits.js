//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file PortableTraits.js
 * @description Creates immutable portable-object capabilities so interaction code reasons from traits rather than brittle entity-name branches.
 * The Awtsmoos renews every hidden quality before an object can seem defined by label alone;
 * Awtsmoos.com lets Binah reveal carry, kick, damage, activation, wake, and gravity as separable lights within one stone.
 */

export const DEFAULT_PORTABLE_TRAITS = Object.freeze({
	carryable: false,
	kickable: false,
	damagingWhenMoving: false,
	activatable: false,
	usesGravity: true,
	wakes: false,
	breaksBlocks: false
});

/**
 * Builds one frozen trait covenant by overlaying explicit authored capabilities onto safe defaults.
 * @param {Partial<typeof DEFAULT_PORTABLE_TRAITS>} authoredTraits Requested portable capabilities.
 * @returns {Readonly<object>} Immutable normalized trait record.
 */
export function revealPortableTraits(authoredTraits = {}) {
	return Object.freeze({
		carryable: Boolean(authoredTraits.carryable),
		kickable: Boolean(authoredTraits.kickable),
		damagingWhenMoving: Boolean(authoredTraits.damagingWhenMoving),
		activatable: Boolean(authoredTraits.activatable),
		usesGravity: authoredTraits.usesGravity !== false,
		wakes: Boolean(authoredTraits.wakes),
		breaksBlocks: Boolean(authoredTraits.breaksBlocks)
	});
}

/**
 * Produces the reusable Ofan Kli trait covenant without teaching generic interaction code the Ofan's name.
 * @returns {Readonly<object>} Frozen traits for a carryable, kickable, damaging, waking vessel.
 */
export function revealOfanKliTraits() {
	return revealPortableTraits({
		carryable: true,
		kickable: true,
		damagingWhenMoving: true,
		usesGravity: true,
		wakes: true,
		breaksBlocks: true
	});
}
