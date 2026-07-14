//B"H
//Boruch Hashem
//Blessed is He

/** Chochmah and Keser guardians escalate through explicit readable phase covenants. */

import { bossPhase as P, expeditionBoss as B } from './bossBuilders.js';

export const CHOCHMAH_KESER_BOSSES = Object.freeze([
	B('rift-sage', 'wisdom-rift', 'The Rift Sage', 'Insight Before Explanation', 310, [
		P('first-flash', 0, 1.12, 1.06, 1.14, 94, 'One silent flash marks the next position.'),
		P('storm-answer', 64, 1.34, 1.2, 1.04, 62, 'Three lightning paths open at once.'),
		P(
			'instant-knowing',
			134,
			1.54,
			1.34,
			0.92,
			42,
			'The Sage moves as the warning appears, not after it.'
		)
	]),
	B('unity-throne', 'throne-road', 'The Throne of Unity', 'Crown Beyond Separation', 52, [
		P('ten-roads', 0, 1.16, 1, 1.22, 96, 'Ten region colors gather around the throne.'),
		P('one-crown', 70, 1.38, 1.16, 1.1, 60, 'The colors collapse into one unwavering crown.'),
		P(
			'nothing-outside',
			145,
			1.6,
			1.3,
			0.94,
			38,
			'The arena falls silent as every road appears at once.'
		)
	])
]);
