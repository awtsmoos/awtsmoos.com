//B"H
//Boruch Hashem
//Blessed is He

/** Hod and Netzach guardians escalate through explicit readable phase covenants. */

import { bossPhase as P, expeditionBoss as B } from './bossBuilders.js';

export const HOD_NETZACH_BOSSES = Object.freeze([
	B(
		'mirror-regent',
		'palace-reflections',
		'The Mirror Regent',
		'Sovereign of Repeated Forms',
		282,
		[
			P(
				'single-reflection',
				0,
				1.1,
				1.04,
				1.14,
				100,
				'One reflection steps out of alignment.'
			),
			P(
				'hall-of-twins',
				58,
				1.26,
				1.15,
				1.06,
				72,
				'Two mirrored silhouettes flank the throne.'
			),
			P(
				'truth-without-glass',
				120,
				1.44,
				1.25,
				0.94,
				50,
				'Every mirror darkens except the Regent itself.'
			)
		]
	),
	B(
		'causeway-champion',
		'endless-causeway',
		'The Unyielding Champion',
		'Runner Beyond Surrender',
		126,
		[
			P(
				'long-breath',
				0,
				1.12,
				1.08,
				1.1,
				96,
				'The Champion lowers into a distance runner stance.'
			),
			P('no-retreat', 62, 1.3, 1.2, 1.02, 66, 'The causeway lamps ignite one after another.'),
			P(
				'endurance-unbound',
				128,
				1.48,
				1.32,
				0.92,
				46,
				'The road itself glows beneath relentless feet.'
			)
		]
	)
]);
