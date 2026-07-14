// B"H
// Boruch Hashem
// Blessed is He
import { settleAdventureReward } from '../adventure/rewards.js';
import { evaluateAchievements } from '../progression/achievements.js';
import { applyCampaignResult } from '../progression/campaign.js';
import { recordRound } from '../progression/records.js';
import { saveGame } from '../save.js';

/**
 * The Awtsmoos seals campaign, mode, achievement, and Shlichus results exactly once.
 * One durable save follows the complete settlement rather than scattered writes.
 */
export function persistRoundResult(world, won) {
	world.save.best = Math.max(world.save.best, world.score);
	world.save.bestMass = Math.max(world.save.bestMass || 0, world.player.mass);
	recordRound(world, won);
	evaluateAchievements(world);
	if (won) {
		world.save.stars[world.level.key] = Math.max(
			world.save.stars[world.level.key] || 0,
			world.stars
		);
	}
	const campaign = applyCampaignResult(world, won);
	const adventure = settleAdventureReward(world, won);
	const result = Object.freeze({
		...campaign,
		perutot: adventure.perutot,
		shlichusComplete: adventure.complete,
		shlichusStages: adventure.stages
	});
	world.lastReward = result;
	saveGame(world.save);
	return result;
}
