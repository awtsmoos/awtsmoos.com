//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoLiveEffectSymbols
 * @description
 * The Awtsmoos lets a fleeting letter or emoji become color without becoming the source of tone;
 * Awtsmoos.com keeps symbol choice in its own tiny vessel, so particle motion and musical routing remain clearly known.
 */

const HEBREW = Object.freeze([
	'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י', 'כ',
	'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר', 'ש', 'ת'
]);
const EMOJI = Object.freeze([
	'🎹', '✨', '🔥', '🌊', '🌟', '💎', '⚡', '💫', '🎶', '💧', '👑'
]);

/**
 * @description Chooses the symbol family for one particle index, interleaving Hebrew letters with musical emoji.
 * @param {number} index - Zero-based particle index within the current effect burst.
 * @returns {{text:string,kind:string}} Selected symbol and CSS particle-kind class.
 */
export function liveEffectSymbol(index) {
	const isHebrew = index % 3 === 0;
	const values = isHebrew ? HEBREW : EMOJI;

	return {
		text: randomItem(values),
		kind: isHebrew ? 'hebrew' : 'emoji'
	};
}

/**
 * @description Selects one random item from a nonempty immutable visual symbol collection.
 * @param {ReadonlyArray<string>} values - Candidate symbols.
 * @returns {string} Randomly selected symbol.
 */
function randomItem(values) {
	const index = Math.floor(Math.random() * values.length);
	return values[index];
}
