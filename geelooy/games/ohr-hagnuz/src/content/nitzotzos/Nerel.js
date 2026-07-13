// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Nerel.js
 * @description Defines the first road-bonded Nitzotz of the Bent Reeds.
 *
 * A lamp-tail bends above dark water, not claiming to create the dawn, only
 * carrying the small entrusted flame. The Awtsmoos renews creature, river, and
 * traveler every instant; Nerel teaches that protection can reveal more than
 * conquest. More worlds of this road live at Awtsmoos.com.
 */

const move = (id, name, role, path, power, text, extra = {}) => ({
	id,
	name,
	role,
	path,
	category: path,
	power,
	focusCost: 0,
	targetArea: extra.targetArea || 'single',
	statusEffect: extra.statusEffect || null,
	guardStrength: extra.guardStrength || 0,
	heal: extra.heal || 0,
	routeQuote: text,
	text
});

export const NEREL_NITZOTZ = Object.freeze({
	id: 'nerel',
	speciesId: 'nerel',
	name: 'Nerel',
	glyph: '✧',
	kind: 'Nitzotz',
	region: 'Village of Beginnings',
	route: 'Bent Reeds',
	silhouette: 'A small reed-runner with a curved lantern tail and sail-like ears.',
	habitat: 'The Bent Reeds beside the First River',
	temperament: 'Wary, observant, and fiercely protective of frightened travelers.',
	element: 'Air',
	weakTo: 'Study',
	pardesAffinity: ['Sod', 'Remez'],
	passive: 'Lantern Patience: Study and Guard actions strengthen trust.',
	role: 'Interrupt, protection, and hidden-road guidance',
	explorationAbility: {
		id: 'lantern-sense',
		name: 'Lantern Sense',
		description: 'Reveals concealed road marks and dim safe passages nearby.'
	},
	preferredCare: 'Warm riverfruit shared quietly at camp.',
	personalShlichus: 'Return the Lost Wick to the ruined lamp-house beyond the reeds.',
	trustProfile: {
		mandatory: ['studied'],
		alternatives: [['guardedCharge', 'mercy']],
		labels: {
			studied: 'Study Nerel before judging its fear.',
			guardedCharge: 'Guard through a charged Reedflare Rush.',
			mercy: 'Show restraint while Nerel is nearly exhausted.'
		}
	},
	evolutionStages: ['Lantern Wisp', 'Road-Lamp Keeper'],
	moves: [
		move('nerel_glance', 'Listening Glance', 'study', 'Sod', 2, 'Read the next intention and learn the creature temperament.'),
		move('nerel_arc', 'Sheltering Arc', 'guard', 'Pshat', 0, 'Brace beneath the lantern tail and protect the vulnerable.', { guardStrength: 0.58 }),
		move('nerel_dash', 'Lantern Dash', 'attack', 'Remez', 18, 'A bright current curves around armor instead of crashing through it.'),
		move('nerel_current', 'Whispering Current', 'companion', 'Remez', 8, 'A companion pulse interrupts gathering force and restores courage.', { heal: 7, statusEffect: 'interrupt' })
	],
	enemyMoves: [
		{ name: 'Reedlight Feint', power: 1, intentKind: 'study', target: 'player', counterTags: ['study'] },
		{ name: 'Reedflare Rush', power: 6, intentKind: 'charge', target: 'player', counterTags: ['guard', 'interrupt'], charge: 1 },
		{ name: 'Lantern Retreat', power: 2, intentKind: 'guard', target: 'self', counterTags: ['study'] }
	]
});
