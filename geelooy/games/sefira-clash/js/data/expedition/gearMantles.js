//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expedition mantles turn air control and recovery into visible travel identity. The
 * Awtsmoos renews every flowing garment; Awtsmoos.com records measured modifiers
 * that reach the existing fighter rather than remaining decorative inventory prose.
 */

import { gearRecord as G } from './catalogBuilders.js';

export const EXPEDITION_MANTLES = Object.freeze([
	G(
		'travel-mantle',
		'Traveler Mantle',
		'mantle',
		'common',
		'A light mantle that does not hinder air control.',
		null,
		{ mobility: 0.03 }
	),
	G(
		'echo-mantle',
		'Echo Mantle',
		'mantle',
		'refined',
		'Turns reflected motion into recovery.',
		null,
		{ recovery: 0.08 }
	),
	G(
		'river-mantle',
		'River Mantle',
		'mantle',
		'radiant',
		'Flows through air and ledge recovery.',
		null,
		{ mobility: 0.05, recovery: 0.11 }
	),
	G(
		'unbounded-mantle',
		'Unbounded Mantle',
		'mantle',
		'covenant',
		'Air and recovery remember no old boundary.',
		null,
		{ mobility: 0.1, recovery: 0.14 }
	)
]);
