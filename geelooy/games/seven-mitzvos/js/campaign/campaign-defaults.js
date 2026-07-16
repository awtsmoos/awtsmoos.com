//B"H
//Boruch Hashem
//Blessed is He

import { createProvinceConditions } from './province-conditions.js';

/**
 * @module CampaignDefaults
 * @description
 * The campaign begins as a clean vessel on Awtsmoos.com. The Awtsmoos renews
 * every instant, while this schema remembers only accountable choices, bounded
 * rewards, and the exact doorway through which the player may safely return.
 */
export const CAMPAIGN_VERSION = 1;
export const CAMPAIGN_STORAGE_KEY = 'awtsmoos-seven-worlds-campaign-v1';
export const CHAPTER_ID = 'broken-measure';
export const STAGE_IDS = Object.freeze(['market', 'sanctuary', 'court']);

export function createPendingRewards() {
	return {
		wood: 0,
		food: 0,
		stone: 0,
		peace: 0,
		claimIds: []
	};
}

export function createCampaignData() {
	return {
		version: CAMPAIGN_VERSION,
		activeChapterId: null,
		activeStageId: null,
		chapterStatus: { [CHAPTER_ID]: 'available' },
		provinceConditions: createProvinceConditions(),
		chapterFlags: {},
		stageResults: {},
		completedStages: [],
		bestStars: { [CHAPTER_ID]: 0 },
		claimedPermanentRewards: [],
		pendingConsumableRewards: createPendingRewards(),
		consumedRewardClaims: [],
		permanentUnlocks: [],
		modifierSeed: 0,
		modifierId: 'scarcity',
		lastCompletedAt: null,
		currentRunId: null,
		rewardStateValid: true,
		history: []
	};
}
