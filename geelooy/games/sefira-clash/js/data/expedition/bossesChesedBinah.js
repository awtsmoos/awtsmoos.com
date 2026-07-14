//B"H
//Boruch Hashem
//Blessed is He

/** Chesed and Binah guardians escalate through explicit readable phase covenants. */

import { bossPhase as P, expeditionBoss as B } from './bossBuilders.js';

export const CHESED_BINAH_BOSSES = Object.freeze([
	B(
		'bridge-seraph',
		'bridge-light',
		'The Bridge Seraph',
		'Guardian of the Living Crossing',
		196,
		[
			P(
				'open-wings',
				0,
				1.08,
				1.04,
				1.2,
				100,
				'Two wings of riverlight unfold above the bridge.'
			),
			P(
				'severed-banks',
				60,
				1.26,
				1.16,
				1.08,
				70,
				'The crossing divides into two answering currents.'
			),
			P(
				'one-river',
				126,
				1.44,
				1.28,
				0.96,
				48,
				'Every strand of light turns toward one central current.'
			)
		]
	),
	B('architect-prime', 'tower-forms', 'The Prime Architect', 'Form Before Motion', 224, [
		P('measured-grid', 0, 1.1, 0.98, 1.2, 102, 'A geometric grid settles over the arena.'),
		P('recursive-form', 62, 1.3, 1.1, 1.08, 70, 'Nested shapes repeat the Architect’s stance.'),
		P(
			'form-without-boundary',
			130,
			1.48,
			1.22,
			0.94,
			46,
			'The grid dissolves while every line remains visible.'
		)
	])
]);
