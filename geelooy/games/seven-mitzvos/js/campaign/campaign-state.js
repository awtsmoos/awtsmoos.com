//B"H
//Boruch Hashem
//Blessed is He

import { CHAPTER_ID, STAGE_IDS, createCampaignData } from './campaign-defaults.js';
import { modifierForSeed, normalizeSeed } from './campaign-modifiers.js';
import { beginChapterConditions, conditionsAfterStage } from './province-conditions.js';
import { claimCampaignRewards, consumeCampaignRewards, pendingCampaignRewards, preservedRewardLedger } from './campaign-reward-state.js';

/**
 * @module CampaignState
 * @description
 * One chapter crosses market, sanctuary, and court on Awtsmoos.com. The
 * Awtsmoos recreates all consequence at once; this finite state reveals it in
 * accountable stages while a separate ledger guards every reward identity.
 */
export class CampaignState {
	constructor(data = createCampaignData(), clock = () => new Date().toISOString()) {
		this.data = JSON.parse(JSON.stringify(data));
		this.clock = clock;
	}

	startChapter(seed = Date.now()) {
		this.data.activeChapterId = CHAPTER_ID;
		this.data.activeStageId = STAGE_IDS[0];
		this.data.chapterStatus[CHAPTER_ID] = 'active';
		this.data.chapterFlags = {};
		this.data.stageResults = {};
		this.data.completedStages = [];
		this.data.modifierSeed = normalizeSeed(seed);
		this.data.modifierId = modifierForSeed(seed).id;
		this.data.currentRunId = `${CHAPTER_ID}:${this.data.modifierSeed}`;
		this.data.provinceConditions = beginChapterConditions();
		return this.snapshot();
	}

	resume() {
		if (this.data.activeChapterId !== CHAPTER_ID || !STAGE_IDS.includes(this.data.activeStageId)) {
			return null;
		}
		return { chapterId: CHAPTER_ID, stageId: this.data.activeStageId };
	}

	completeStage(stageId, result) {
		if (stageId !== this.data.activeStageId || !STAGE_IDS.includes(stageId)) {
			return { ok: false, reason: 'stage-order' };
		}
		const safeResult = JSON.parse(JSON.stringify(result || {}));
		this.data.stageResults[stageId] = safeResult;
		this.data.chapterFlags = { ...this.data.chapterFlags, ...safeResult };
		this.data.completedStages = [...new Set([...this.data.completedStages, stageId])];
		this.data.provinceConditions = conditionsAfterStage(this.data.provinceConditions, stageId, safeResult);
		const nextIndex = STAGE_IDS.indexOf(stageId) + 1;
		this.data.activeStageId = STAGE_IDS[nextIndex] || null;
		return { ok: true, nextStageId: this.data.activeStageId };
	}

	completeChapter(stars, rewards, summary = {}) {
		if (this.data.completedStages.length !== STAGE_IDS.length) {
			return { ok: false, reason: 'incomplete-stages' };
		}
		this.data.chapterStatus[CHAPTER_ID] = 'complete';
		this.data.activeStageId = null;
		this.data.bestStars[CHAPTER_ID] = Math.max(this.data.bestStars[CHAPTER_ID], stars);
		this.data.lastCompletedAt = this.clock();
		claimCampaignRewards(this.data, rewards);
		this.recordHistory(stars, summary);
		return { ok: true, snapshot: this.snapshot() };
	}

	restartChapter() {
		return this.startChapter(this.data.modifierSeed || 1);
	}

	resetCampaign() {
		const preserved = preservedRewardLedger(this.data);
		this.data = createCampaignData();
		Object.assign(this.data, preserved);
		return this.snapshot();
	}

	pendingRewards() {
		return pendingCampaignRewards(this.data);
	}

	consumePendingRewards() {
		return consumeCampaignRewards(this.data);
	}

	snapshot() {
		return JSON.parse(JSON.stringify(this.data));
	}

	recordHistory(stars, summary) {
		this.data.history.push({
			runId: this.data.currentRunId,
			stars,
			at: this.data.lastCompletedAt,
			...summary
		});
		this.data.history = this.data.history.slice(-20);
	}
}
