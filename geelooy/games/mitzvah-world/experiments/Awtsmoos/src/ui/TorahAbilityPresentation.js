// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TorahAbilityPresentation.js
 * @description Local scalable symbols and color tokens for canonical Torah abilities.
 */

const PRESENTATION = Object.freeze({
	'grateful-awakening': presentation('מ', 'awakening'),
	'guarded-thought': presentation('ד', 'clarity'),
	'joy-breaks-barriers': presentation('ש', 'joy'),
	'light-against-concealment': presentation('אור', 'illumination'),
	'merciful-restraint': presentation('ר', 'restraint'),
	'shield-of-trust': presentation('ב', 'protection'),
	'stillness-of-shabbos': presentation('שב', 'peace'),
	'voice-of-unity': presentation('אחד', 'unity'),
	'waters-of-purification': presentation('מים', 'purification')
});

const FALLBACK = presentation('ת', 'clarity');

export function torahAbilityPresentation(abilityId) {
	return PRESENTATION[abilityId] || FALLBACK;
}

function presentation(glyph, tone) {
	return Object.freeze({ glyph, tone });
}
