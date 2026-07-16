//B"H
//Boruch Hashem
//Blessed is He

import { CAMPAIGN_VERSION, CHAPTER_ID, STAGE_IDS, createCampaignData, createPendingRewards } from './campaign-defaults.js';
import { CAMPAIGN_MODIFIERS, modifierForSeed, normalizeSeed } from './campaign-modifiers.js';

/**
 * @module CampaignValidator
 * @description
 * A save may arrive broken, old, or malicious, yet Awtsmoos.com grants no
 * reward from uncertainty. The Awtsmoos gives truth without parsing; this
 * finite gate quarantines doubtful rewards and restores a harmless campaign.
 */
export function validateCampaignData(value) {
	if (!isObject(value) || value.version !== CAMPAIGN_VERSION) {
		return fallback('unknown-or-malformed-version');
	}
	const data = createCampaignData();
	data.activeChapterId = value.activeChapterId === CHAPTER_ID ? CHAPTER_ID : null;
	data.activeStageId = STAGE_IDS.includes(value.activeStageId) ? value.activeStageId : null;
	data.chapterStatus[CHAPTER_ID] = ['available', 'active', 'complete'].includes(value.chapterStatus?.[CHAPTER_ID])
		? value.chapterStatus[CHAPTER_ID]
		: 'available';
	data.provinceConditions = sanitizeConditions(value.provinceConditions, data.provinceConditions);
	data.chapterFlags = safeRecord(value.chapterFlags);
	data.stageResults = safeRecord(value.stageResults);
	data.completedStages = safeStrings(value.completedStages).filter(id => STAGE_IDS.includes(id));
	data.bestStars[CHAPTER_ID] = clamp(value.bestStars?.[CHAPTER_ID], 0, 3);
	data.claimedPermanentRewards = safeStrings(value.claimedPermanentRewards);
	data.consumedRewardClaims = safeStrings(value.consumedRewardClaims);
	data.permanentUnlocks = safeStrings(value.permanentUnlocks);
	data.modifierSeed = normalizeSeed(value.modifierSeed);
	data.modifierId = CAMPAIGN_MODIFIERS.some(item => item.id === value.modifierId)
		? value.modifierId
		: modifierForSeed(data.modifierSeed).id;
	data.lastCompletedAt = typeof value.lastCompletedAt === 'string' ? value.lastCompletedAt : null;
	data.currentRunId = typeof value.currentRunId === 'string' ? value.currentRunId : null;
	data.history = Array.isArray(value.history) ? value.history.filter(isObject).slice(-20) : [];
	const rewards = sanitizePending(value.pendingConsumableRewards);
	data.pendingConsumableRewards = rewards.value;
	data.rewardStateValid = value.rewardStateValid === true && rewards.valid;
	return { data, valid: true, reason: data.rewardStateValid ? 'valid' : 'reward-quarantine' };
}

function fallback(reason) {
	const data = createCampaignData();
	data.rewardStateValid = false;
	return { data, valid: false, reason };
}

function sanitizePending(value) {
	if (!isObject(value) || !Array.isArray(value.claimIds)) {
		return { value: createPendingRewards(), valid: false };
	}
	const pending = createPendingRewards();
	pending.wood = clamp(value.wood, 0, 10);
	pending.food = clamp(value.food, 0, 10);
	pending.stone = clamp(value.stone, 0, 6);
	pending.peace = clamp(value.peace, 0, 3);
	pending.claimIds = safeStrings(value.claimIds);
	const valid = ['wood', 'food', 'stone', 'peace'].every(key => Number.isFinite(Number(value[key])));
	return { value: pending, valid };
}

function sanitizeConditions(value, defaults) {
	if (!isObject(value)) {
		return defaults;
	}
	return Object.fromEntries(Object.entries(defaults).map(([id, original]) => {
		const candidate = value[id];
		const status = ['stable', 'strained', 'crisis'].includes(candidate?.status) ? candidate.status : original.status;
		const objective = typeof candidate?.objective === 'string' ? candidate.objective : original.objective;
		return [id, { status, objective }];
	}));
}

function safeRecord(value) {
	return isObject(value) ? JSON.parse(JSON.stringify(value)) : {};
}

function safeStrings(value) {
	return Array.isArray(value) ? [...new Set(value.filter(item => typeof item === 'string'))] : [];
}

function clamp(value, minimum, maximum) {
	const number = Number(value);
	return Number.isFinite(number) ? Math.max(minimum, Math.min(maximum, Math.round(number))) : minimum;
}

function isObject(value) {
	return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}
