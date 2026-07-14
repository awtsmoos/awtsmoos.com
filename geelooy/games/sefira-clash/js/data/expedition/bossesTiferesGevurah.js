//B"H
//Boruch Hashem
//Blessed is He

/** Tiferes and Gevurah guardians escalate through explicit readable phase covenants. */

import { bossPhase as P, expeditionBoss as B } from './bossBuilders.js';

export const TIFERES_GEVURAH_BOSSES = Object.freeze([
	B('heart-conductor', 'heart-sanctum', 'The Heart Conductor', 'Voice of Balanced Force', 48, [
		P('first-measure', 0, 1.1, 1, 1.16, 102, 'A quiet chord gathers across the sanctum.'),
		P(
			'counterpoint',
			60,
			1.28,
			1.12,
			1.08,
			70,
			'Two opposing melodies cross behind the Conductor.'
		),
		P(
			'unified-cadence',
			124,
			1.45,
			1.22,
			0.96,
			48,
			'Every platform pulses in one radiant measure.'
		)
	]),
	B('furnace-judge', 'furnace-depths', 'The Furnace Judge', 'Law Inside the Flame', 4, [
		P('tempered-law', 0, 1.14, 0.96, 1.2, 98, 'A square of embers closes around the Judge.'),
		P(
			'red-verdict',
			65,
			1.32,
			1.08,
			1.08,
			68,
			'The furnace vents speak in alternating columns.'
		),
		P(
			'white-heat',
			132,
			1.52,
			1.18,
			0.94,
			46,
			'The Judge becomes a white silhouette inside the flame.'
		)
	])
]);
