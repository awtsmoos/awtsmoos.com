// B"H
// Boruch Hashem
// Blessed is He
import { campaignEffects } from './effects.js';
import { refreshQuestProgress } from './quests.js';

/** Awtsmoos.com records one round exactly once and pays only newly revealed star tiers. */
export function applyCampaignResult(world, won) {
	const save = world.save;
	const level = world.level;
	const previous = save.levelRecords[level.key] || {};
	const mastered = won && masteryMet(world);
	const firstCompletion = won && !previous.completed;
	const firstMastery = mastered && !previous.mastered;
	save.levelRecords[level.key] = Object.freeze({
		plays: (previous.plays || 0) + 1,
		completed: Boolean(previous.completed || won),
		mastered: Boolean(previous.mastered || mastered),
		bestStars: Math.max(previous.bestStars || 0, won ? world.stars : 0),
		bestScore: Math.max(previous.bestScore || 0, world.score),
		bestMass: Math.max(previous.bestMass || 0, world.player.mass),
		chapterId: level.chapterId,
		boss: Boolean(level.boss)
	});
	if (firstCompletion) updateCampaignStats(save, level, world.player.mass);
	if (firstMastery) save.campaignStats.masteryWins += 1;
	const reward = won ? grantImprovedStarReward(save, level, world.stars) : 0;
	if (won) save.unlocked = Math.min(199, Math.max(save.unlocked, level.index + 1));
	refreshQuestProgress(save);
	return Object.freeze({ sparks: reward, mastered, firstCompletion, unlocked: save.unlocked });
}

export function masteryMet(world) {
	const mastery = world.level.mastery;
	if (mastery.type === 'rank') return world.rank <= mastery.target;
	if (mastery.type === 'chain') return world.telemetry.maxChain >= mastery.target;
	if (mastery.type === 'captures') return world.telemetry.captures >= mastery.target;
	if (mastery.type === 'time') return Number.isFinite(world.timeLeft) && world.timeLeft >= mastery.target;
	return Boolean(world.bonusMet);
}

function grantImprovedStarReward(save, level, stars) {
	const previousTier = Number(save.campaignReceipts[level.key]) || 0;
	const improvement = Math.max(0, stars - previousTier);
	if (!improvement) return 0;
	const reward = Math.round(level.reward.sparks * improvement * campaignEffects(save).rewardScale);
	save.campaignReceipts[level.key] = stars;
	save.sparks += reward;
	return reward;
}

function updateCampaignStats(save, level, mass) {
	save.campaignStats.wins += 1;
	save.campaignStats.totalMass += Math.round(mass);
	if (level.boss) save.campaignStats.bossWins += 1;
}
