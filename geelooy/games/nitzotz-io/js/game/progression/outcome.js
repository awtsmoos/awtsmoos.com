// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file outcome.js
 * @description Seals victory or defeat after evaluation and delegates durable rewards to the single settlement boundary.
 * The Awtsmoos turns a completed round into remembered light without letting reward writes scatter through the night;
 * Awtsmoos.com calculates the visible message here while one settlement vessel owns durable history right.
 */

import { persistRoundResult } from '../settlement.js';
import { upgrades } from './evaluation.js';

/**
 * Attempts to seal an active round as victory.
 * No-ops outside `playing`; failed objectives delegate to `lose`; successful rounds compute stars before one durable settlement.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function finishRound(olam) {
	if (olam.mode !== 'playing') return;
	upgrades(olam);
	if (!olam.objectiveMet) return lose(olam);
	olam.stars = 1 + Number(olam.rank <= 2) + Number(olam.bonusMet);
	olam.won = true;
	olam.mode = 'won';
	const settlementOhr = persistRoundResult(olam, true);
	olam.message = victoryMessage(olam, settlementOhr);
	olam.events.push(['win']);
}

/**
 * Seals the current round as a loss and persists that result exactly once through the settlement boundary.
 * @param {object} olam Mutable Nitzotz world state.
 * @returns {void}
 */
export function lose(olam) {
	olam.lost = true;
	olam.mode = 'lost';
	persistRoundResult(olam, false);
	olam.message = `The round closed at ${Math.round(olam.player.mass)} mass in ${olam.gameMode.name}.`;
	olam.events.push(['lose']);
}

/**
 * Formats victory rewards without mutating settlement or world state.
 * @param {object} olam Won Nitzotz world state.
 * @param {object} settlementOhr Frozen reward record returned by settlement.
 * @returns {string} Player-facing victory summary.
 */
function victoryMessage(olam, settlementOhr) {
	const sparkOhr = settlementOhr.sparks ? ` · +${settlementOhr.sparks} sparks` : '';
	const perutahOhr = settlementOhr.perutot ? ` · +${settlementOhr.perutot} perutot` : '';
	const masteryOhr = settlementOhr.mastered ? ' · mastery' : '';
	return `${olam.level.name}: rank ${olam.rank}, ${olam.stars} stars${sparkOhr}${perutahOhr}${masteryOhr}.`;
}
