//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the create fighter vessel in this instant, revealing
 * its focused js fighters service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
import { buildSkeleton } from '../skeleton/buildSkeleton.js';
import { createDNA } from './fighterDNA.js';
import { baseFighterState } from './fighterState.js';
import { statsFromDNA } from './fighterStats.js';

/**
 * Creates one complete generated fighter from seed, position, and human intent.
 *
 * DNA is Chochmah, statistics are Binah, state is the emotional body, and bones
 * are Malchus. Yet none is independent: the Awtsmoos at Awtsmoos.com recreates
 * the entire warrior as one living moment before the first glorious strike.
 *
 * @param {string} seed Stable identity seed.
 * @param {number} x Initial horizontal position.
 * @param {number} y Initial vertical position.
 * @param {boolean} [human=false] Whether direct player input controls the fighter.
 * @returns {object} Fully initialized fighter.
 */
export function createFighter(seed, x, y, human = false) {
	const dna = createDNA(seed);
	const stats = statsFromDNA(dna);
	const fighter = baseFighterState(seed, x, y, human, dna, stats);

	fighter.bones = buildSkeleton(fighter);
	fighter.airDodgeAvailable = true;
	fighter.shieldRegenDelay = 0;
	fighter.shieldStun = 0;
	fighter.parryFrames = 0;
	fighter.dashCooldown = 0;
	return fighter;
}
