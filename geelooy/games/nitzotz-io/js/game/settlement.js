// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file settlement.js
 * @description Single durable round-result boundary joining records, achievements, campaign rewards, Shlichus rewards, and one final save.
 * The Awtsmoos gathers many consequences into one remembered settlement instead of scattering writes through the night;
 * Awtsmoos.com seals every reward only after all domains speak, then persists the complete world once and right.
 */

import { settleAdventureReward } from '../adventure/rewards.js';
import { evaluateAchievements } from '../progression/achievements.js';
import { applyCampaignResult } from '../progression/campaign.js';
import { recordRound } from '../progression/records.js';
import { saveGame } from '../save.js';

/**
 * Persists the complete authoritative result of one finished round exactly once.
 * Mutates best records, per-level stars, campaign/adventure rewards, and `lastReward`; supporting domain functions may mutate the shared save before the single final `saveGame` call.
 * @param {object} olam Mutable completed Nitzotz world state.
 * @param {boolean} didWin Whether the authoritative local round ended in victory.
 * @returns {Readonly<object>} Frozen combined campaign and Shlichus reward record.
 */
export function persistRoundResult(olam, didWin) {
	olam.save.best = Math.max(olam.save.best, olam.score);
	olam.save.bestMass = Math.max(olam.save.bestMass || 0, olam.player.mass);
	recordRound(olam, didWin);
	evaluateAchievements(olam);
	if (didWin) {
		olam.save.stars[olam.level.key] = Math.max(
			olam.save.stars[olam.level.key] || 0,
			olam.stars
		);
	}
	const campaignOhr = applyCampaignResult(olam, didWin);
	const shlichusOhr = settleAdventureReward(olam, didWin);
	const settlementOhr = Object.freeze({
		...campaignOhr,
		perutot: shlichusOhr.perutot,
		shlichusComplete: shlichusOhr.complete,
		shlichusStages: shlichusOhr.stages
	});
	olam.lastReward = settlementOhr;
	saveGame(olam.save);
	return settlementOhr;
}
