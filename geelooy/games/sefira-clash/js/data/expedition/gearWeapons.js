//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition weapons are named tactical identities over real weapon families. The
 * Awtsmoos renews blade, staff, axe, shield, and gauntlet; Awtsmoos.com records
 * bounded modifiers without inventing collision geometry that the game does not own.
 */

import { gearRecord as G } from './catalogBuilders.js';

export const EXPEDITION_WEAPONS = Object.freeze([
	G('training-sword', 'Pilgrim Sword', 'weapon', 'common', 'A balanced first blade.', 'sword', {
		power: 0.04
	}),
	G('cedar-edge', 'Cedar Edge', 'weapon', 'refined', 'A fast Malchus blade.', 'sword', {
		power: 0.07,
		mobility: 0.03
	}),
	G(
		'moon-staff',
		'Moonwork Staff',
		'weapon',
		'refined',
		'Foundation energy extends every strike.',
		'staff',
		{ power: 0.06, recovery: 0.07 }
	),
	G(
		'mirror-blade',
		'Mirror Blade',
		'weapon',
		'refined',
		'A deceptive edge with quick cadence.',
		'sword',
		{ power: 0.08, mobility: 0.05 }
	),
	G(
		'causeway-spear',
		'Causeway Spear',
		'weapon',
		'radiant',
		'Long reach for relentless pursuit.',
		'staff',
		{ power: 0.1, mobility: 0.04 }
	),
	G(
		'gevurah-axe',
		'Foundry Axe',
		'weapon',
		'radiant',
		'Severe force with deliberate cadence.',
		'axe',
		{ power: 0.17, mobility: -0.05 }
	),
	G(
		'mercy-shield',
		'Shield of Open Hands',
		'weapon',
		'radiant',
		'Defense that still moves forward.',
		'shield',
		{ guard: 0.13, recovery: 0.05 }
	),
	G(
		'storm-gauntlet',
		'Storm Gauntlet',
		'weapon',
		'covenant',
		'Sudden power carried through a short blade.',
		'sword',
		{ power: 0.15, mobility: 0.08 }
	)
]);
