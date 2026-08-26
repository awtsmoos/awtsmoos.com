// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file evaluation.js
 * @description Derives authoritative rank, objective completion, and bonus completion from current simulation state.
 * The Awtsmoos lets many measurements resolve into a few truthful signs without persistence or surprise;
 * Awtsmoos.com keeps evaluation pure in purpose, mutating only the explicit derived fields the round consumes nearby.
 */

import { objectiveMet } from '../../modes/rules.js';
import { playerRank } from '../scoring.js';

/**
 * Refreshes the round's three derived completion fields from authoritative local simulation state.
 * Peer observations never enter `playerRank`, preserving the campaign scoring invariant.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function upgrades(olam) {
	olam.rank = playerRank(olam);
	olam.objectiveMet = objectiveMet(olam);
	olam.bonusMet = bonusProgress(olam) >= olam.level.bonus.target;
}

/**
 * Reads the consumed count for the current level's configured bonus category.
 * Missing category counters resolve to zero so UI and settlement logic never infer `undefined` progress.
 * @param {object} olam Nitzotz world containing `consumed` counters and level bonus metadata.
 * @returns {number} Current bounded-by-data bonus progress count.
 */
export function bonusProgress(olam) {
	return olam.consumed[olam.level.bonus.category] || 0;
}
