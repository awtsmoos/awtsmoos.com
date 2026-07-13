//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the smash effects vessel in this instant, revealing
 * its focused js particles service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Smash effect recipes.
 *
 * Chapter 213: a smash is not a large jab. It has a ring, a callout, a haptic
 * oath, and enough visual authority to tell the player something decisive
 * happened.
 */
export function smashEffectRecipe(event) {
	const charge = event.charge || 0;
	return {
		ringSize: 48 + charge * 96,
		callout: event.fullCharge ? 'MAX' : 'SMASH',
		glyph: event.letter || 'ץ',
		color: event.color || '#fff0a8',
		haptic: event.fullCharge ? [28, 20, 36] : [18]
	};
}
