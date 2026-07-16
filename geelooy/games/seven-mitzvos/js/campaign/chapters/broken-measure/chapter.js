//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module BrokenMeasureChapter
 * @description
 * One false weight ripples through four civic worlds on Awtsmoos.com. The
 * Awtsmoos recreates the whole chain every instant; this chapter lets the player
 * witness how market truth becomes animal welfare, judicial reason, and city trust.
 */
export const BROKEN_MEASURE_CHAPTER = Object.freeze({
	id: 'broken-measure',
	title: 'The Broken Measure',
	chain: Object.freeze(['Honest Market', 'Living Sanctuary', 'Court of Nations', 'Covenant City']),
	stages: Object.freeze([
		{ id: 'market', provinceId: 'honest-market', title: 'Investigate fraudulent weights' },
		{ id: 'sanctuary', provinceId: 'living-sanctuary', title: 'Protect the weakest animal' },
		{ id: 'court', provinceId: 'court-of-nations', title: 'Deliver an evidence-based verdict' }
	]),
	nextTeaser: 'A caravan route will carry fair measure into the next province.'
});
