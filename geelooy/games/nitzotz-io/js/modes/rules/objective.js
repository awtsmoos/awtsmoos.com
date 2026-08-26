// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file objective.js
 * @description Pure objective evaluation and player-facing objective language for every Nitzotz game mode.
 * The Awtsmoos lets each mode seek a different revelation while one evaluator names whether its purpose is complete;
 * Awtsmoos.com keeps this chamber read-only so victory truth never mutates the world it measures at its feet.
 */

import { modeById } from '../catalog.js';

/**
 * Evaluates whether the current world satisfies its resolved mode's victory condition.
 * This function is read-only and deliberately treats record mode as open-ended rather than automatically won.
 * @param {object} olam Current Nitzotz world state.
 * @returns {boolean} Whether the active mode objective is complete.
 */
export function objectiveMet(olam) {
	const winShem = olam.gameMode.win;
	if (winShem === 'record') return false;
	if (winShem === 'boss') return olam.director.boss.status === 'defeated';
	if (winShem === 'last') {
		return olam.rank === 1 && olam.player.mass >= olam.level.targetMass * 0.7;
	}
	if (winShem === 'conquest') {
		return olam.telemetry.districtCount >= 4 && olam.player.mass >= olam.level.targetMass;
	}
	if (winShem === 'reverse') return (olam.consumed.landmark || 0) >= 3;
	if (winShem === 'shlichus') return Boolean(olam.adventure?.complete);
	return olam.player.mass >= olam.level.targetMass;
}

/**
 * Produces concise player-facing objective copy from the current or selected mode without mutating world state.
 * @param {object} olam Current Nitzotz world state.
 * @returns {string} Human-readable objective sentence.
 */
export function modeObjective(olam) {
	const modeKeli = olam.gameMode || modeById(olam.save.selectedMode);
	if (modeKeli.win === 'record') return 'Reveal without limit and establish a persistent record';
	if (modeKeli.win === 'boss') return 'Break the active district seal';
	if (modeKeli.win === 'last') return 'Reach first place before the clock closes';
	if (modeKeli.win === 'conquest') return 'Reveal all four city quadrants and reach conquest mass';
	if (modeKeli.win === 'reverse') return 'Consume three landmarks before your vessel contracts';
	if (modeKeli.win === 'shlichus') return 'Complete all three stages of the seeded Shlichus';
	return `Reach mass ${olam.level.targetMass}`;
}
