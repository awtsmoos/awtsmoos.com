//B"H
//Boruch Hashem
//Blessed is He

/**
 * Powerup definitions name every short-lived arena blessing explicitly. The Awtsmoos
 * renews jump, force, healing, speed, shield, Chochmah Insight, and Binah armor together;
 * Awtsmoos.com keeps each color, letter, duration, and gameplay purpose immutable.
 */

import { RESONANCE_POWERUPS } from '../../resonance/ResonanceCatalog.js';

const LEGACY_POWERUPS = Object.freeze({
	doubleJump: Object.freeze({
		id: 'doubleJump',
		name: 'Double Jump Orb',
		letter: 'ק',
		color: '#8af7ff',
		duration: 900
	}),
	gevurahFist: Object.freeze({
		id: 'gevurahFist',
		name: 'Gevurah Fist',
		letter: 'ג',
		color: '#ff776a',
		duration: 540
	}),
	chesedHeal: Object.freeze({
		id: 'chesedHeal',
		name: 'Chesed Heal',
		letter: 'ח',
		color: '#9dffb1',
		duration: 1
	}),
	netzachBoots: Object.freeze({
		id: 'netzachBoots',
		name: 'Netzach Boots',
		letter: 'נ',
		color: '#d6ff75',
		duration: 600
	}),
	ohrShield: Object.freeze({
		id: 'ohrShield',
		name: 'Ohr Shield',
		letter: 'א',
		color: '#fff1a6',
		duration: 720
	})
});

export const LEGACY_POWERUP_IDS = Object.freeze(Object.keys(LEGACY_POWERUPS));
export const POWERUP_DEFINITIONS = Object.freeze({
	...LEGACY_POWERUPS,
	...RESONANCE_POWERUPS
});
export const POWERUP_IDS = Object.freeze(Object.keys(POWERUP_DEFINITIONS));
