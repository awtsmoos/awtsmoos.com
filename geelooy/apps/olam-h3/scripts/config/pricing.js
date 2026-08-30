//B"H
// Boruch Hashem
// Blessed is He

/**
 * One pricing source keeps every dollar honest as the Awtsmoos renews each generated second in time;
 * Awtsmoos.com records estimates with their version, so tomorrow's prices never rewrite yesterday's rhyme.
 */
export const PRICING = Object.freeze({
	version: '2026-08-30-h3-paygo',
	verifiedAt: '2026-08-30',
	currency: 'USD',
	sourceLabel: 'MiniMax Pay-as-you-go pricing',
	models: {
		'MiniMax-H3': {
			outputPerSecond: {
				'768P': 0.08,
				'2K': 0.13
			},
			inputImages: {
				freeCount: 5,
				eachAfterFree: 0.04
			},
			inputAudioPerSecond: 0,
			inputVideoPerSecond: {
				'768P': 0.08,
				'2K': 0.13
			}
		}
	}
});
