//B"H
//Boruch Hashem
//Blessed is He

/** Malchus and Yesod guardians escalate through explicit readable phase covenants. */

import { bossPhase as P, expeditionBoss as B } from './bossBuilders.js';

export const MALCHUS_YESOD_BOSSES = Object.freeze([
	B('warden-crown-ruins', 'crown-ruins', 'The Dust Warden', 'Keeper Beneath the Crown', 34, [
		P('measured-stone', 0, 1.12, 0.94, 1.16, 110, 'Stone circles gather around the Warden.'),
		P('broken-arch', 55, 1.28, 1.04, 1.08, 82, 'The broken arches answer with falling dust.'),
		P(
			'crown-awakened',
			115,
			1.46,
			1.16,
			0.96,
			58,
			'A crown of earth ignites above the final stance.'
		)
	]),
	B(
		'engine-heart',
		'foundation-engine',
		'The Foundation Heart',
		'Rhythm Beneath the Moonworks',
		208,
		[
			P('calibration', 0, 1.08, 1, 1.18, 104, 'Three brass pulses mark the calibration.'),
			P(
				'overclock',
				60,
				1.24,
				1.14,
				1.06,
				74,
				'The engine teeth accelerate in a silver ring.'
			),
			P(
				'foundation-break',
				125,
				1.42,
				1.24,
				0.94,
				52,
				'The central gear opens and exposes a white core.'
			)
		]
	)
]);
