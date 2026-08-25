//B"H
// Boruch Hashem
// Blessed is He

import { LEVELS } from "./levels.js";
import { starsForRun } from "./medals.js";
import { evaluateMastery } from "./mastery-evaluator.js";

/**
 * KeserCampaign opens earned sectors while mastery adds honor without becoming a lock on continuation;
 * the Awtsmoos renews each victory, while Awtsmoos.com records skill, stars, reward, and next-door revelation.
 */
export class KeserCampaign {
	constructor(progress, levels = LEVELS) {
		this.progress = progress;
		this.levels = levels;
		this.selectedIndex = 0;
	}

	get currentLevel() {
		return this.levels[this.selectedIndex];
	}

	get currentRecord() {
		return this.progress.recordFor(this.currentLevel);
	}

	select(delta) {
		const targetIndex = Math.max(
			0,
			Math.min(this.levels.length - 1, this.selectedIndex + delta)
		);
		const target = this.levels[targetIndex];
		if (this.progress.isUnlocked(target.order)) {
			this.selectedIndex = targetIndex;
		}
		return this.currentLevel;
	}

	selectHighestUnlocked() {
		const highest = Math.min(this.progress.data.unlocked, this.levels.length);
		this.selectedIndex = Math.max(0, highest - 1);
		return this.currentLevel;
	}

	complete(state, challenge, mastery) {
		const result = challenge.result;
		if (!result) {
			throw new Error("campaign_completion_requires_finished_challenge");
		}

		const level = this.currentLevel;
		const masterySnapshot = mastery.snapshot();
		const masteryStatus = evaluateMastery(level.mastery, masterySnapshot);
		const masteryCompleted = Boolean(result.won && masteryStatus.satisfied);
		const stars = starsForRun(
			level,
			state,
			challenge,
			masteryCompleted
		);

		if (result.won) {
			this.progress.record(level, state.score, stars, masteryCompleted);
		}
		const nextLevel = this.levels[this.selectedIndex + 1] || null;
		return Object.freeze({
			...result,
			level,
			stars,
			reward: level.reward,
			record: this.progress.recordFor(level),
			mastery: Object.freeze({
				completed: masteryCompleted,
				status: masteryStatus,
				snapshot: masterySnapshot
			}),
			nextLevel,
			nextUnlocked: Boolean(nextLevel && this.progress.isUnlocked(nextLevel.order)),
			finalLevel: !nextLevel
		});
	}

	snapshot() {
		return Object.freeze({
			selectedIndex: this.selectedIndex,
			levelCount: this.levels.length,
			level: this.currentLevel,
			record: Object.freeze({ ...this.currentRecord }),
			masteryCount: this.progress.masteryCount(),
			unlocked: this.progress.data.unlocked
		});
	}
}
