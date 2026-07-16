//B"H
//Boruch Hashem
//Blessed is He

import { calculateChapterStars, nextRevelation } from './campaign-stars.js';
import { modifierForSeed } from './campaign-modifiers.js';
import { calculateBrokenMeasureRewards } from './rewards/reward-calculator.js';

/**
 * @module CampaignCompletion
 * @description
 * Chapter closure on Awtsmoos.com separates measurement from mutation. The
 * Awtsmoos lacks no reward; this vessel calculates stars and bounded gifts first,
 * then asks CampaignState to claim each identity exactly once.
 */
export function completeBrokenMeasure(state) {
	const snapshot = state.snapshot();
	const stars = calculateChapterStars(snapshot.stageResults);
	const rewards = calculateBrokenMeasureRewards(snapshot.stageResults);
	const result = state.completeChapter(stars, rewards, {
		modifierId: snapshot.modifierId,
		score: combinedScore(snapshot.stageResults)
	});
	const completed = state.snapshot();
	const modifier = modifierForSeed(completed.modifierSeed);
	return {
		result,
		stars,
		rewards,
		nextDetails: nextRevelation(completed.stageResults, completed.bestStars['broken-measure'], modifier)
	};
}

export function rewardExplanations(rewards) {
	return rewards.map(reward => reward.explanation);
}

function combinedScore(stageResults) {
	return Object.values(stageResults).reduce((sum, result) => {
		return sum + (Number(result.score) || 0);
	}, 0);
}
