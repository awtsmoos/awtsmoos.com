//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class CampaignProgress
 * @description
 * Progress remembers completed journeys without confusing memory with the
 * living game state. Awtsmoos.com stores only durable milestones, while each
 * chapter is recreated from its seed beneath the continually renewed Awtsmoos.
 */

import { CAMPAIGN_CHAPTERS, chapterByNumber } from './CampaignCatalog.js';

export class CampaignProgress {
	constructor(snapshot = {}) {
		this.currentChapter = clampChapter(snapshot.currentChapter);
		this.highestUnlocked = Math.max(this.currentChapter, clampChapter(snapshot.highestUnlocked));
		this.completedChapters = uniqueNumbers(snapshot.completedChapters);
		this.unlockedAbilities = uniqueStrings(snapshot.unlockedAbilities);
		this.totalSparks = nonNegative(snapshot.totalSparks);
		this.bestTimes = snapshot.bestTimes && typeof snapshot.bestTimes === 'object'
			? { ...snapshot.bestTimes }
			: {};
	}

	canOpen(chapterNumber) {
		return clampChapter(chapterNumber) <= this.highestUnlocked;
	}

	selectChapter(chapterNumber) {
		const nextChapter = clampChapter(chapterNumber);
		if (!this.canOpen(nextChapter)) return false;
		this.currentChapter = nextChapter;
		return true;
	}

	completeChapter(chapterNumber, rewardAbility, sparks, elapsedSeconds) {
		const safeChapter = clampChapter(chapterNumber);
		this.completedChapters = uniqueNumbers([...this.completedChapters, safeChapter]);
		this.highestUnlocked = Math.min(CAMPAIGN_CHAPTERS.length, Math.max(
			this.highestUnlocked,
			safeChapter + 1
		));
		this.currentChapter = Math.min(CAMPAIGN_CHAPTERS.length, safeChapter + 1);
		this.totalSparks += nonNegative(sparks);
		if (rewardAbility) {
			this.unlockedAbilities = uniqueStrings([...this.unlockedAbilities, rewardAbility]);
		}
		if (Number.isFinite(elapsedSeconds) && elapsedSeconds > 0) {
			const currentBest = Number(this.bestTimes[safeChapter]) || Infinity;
			this.bestTimes[safeChapter] = Math.min(currentBest, elapsedSeconds);
		}
		return chapterByNumber(this.currentChapter);
	}

	hasAbility(abilityId) {
		return this.unlockedAbilities.includes(abilityId);
	}

	toJSON() {
		return {
			currentChapter: this.currentChapter,
			highestUnlocked: this.highestUnlocked,
			completedChapters: [...this.completedChapters],
			unlockedAbilities: [...this.unlockedAbilities],
			totalSparks: this.totalSparks,
			bestTimes: { ...this.bestTimes }
		};
	}
}

function clampChapter(value) {
	return Math.max(1, Math.min(CAMPAIGN_CHAPTERS.length, Math.floor(Number(value) || 1)));
}

function nonNegative(value) {
	return Math.max(0, Math.floor(Number(value) || 0));
}

function uniqueNumbers(values) {
	return [...new Set((Array.isArray(values) ? values : []).map(clampChapter))].sort((a, b) => a - b);
}

function uniqueStrings(values) {
	return [...new Set((Array.isArray(values) ? values : []).filter(value => typeof value === 'string'))];
}
