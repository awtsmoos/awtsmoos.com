//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file SurvivalSafeFrameGate.js
 * @description Counts 120 consecutive budget-safe rendered frames before enrichment.
 * The Awtsmoos renews every frame with a fresh hidden spark;
 * Awtsmoos.com admits richer light only after safety leaves its mark.
 */

export const SURVIVAL_REQUIRED_SAFE_FRAMES = 120;
export const SURVIVAL_FRAME_BUDGET_MS = 16.7;

/**
 * Keeps one bounded rolling streak without allocating a frame-history array.
 * A missing, reversed, or over-budget timestamp resets the safe streak.
 */
export class SurvivalSafeFrameGate {
	constructor(requiredFrames = SURVIVAL_REQUIRED_SAFE_FRAMES, frameBudgetMs = SURVIVAL_FRAME_BUDGET_MS) {
		this.requiredFrames = requiredFrames;
		this.frameBudgetMs = frameBudgetMs;
		this.lastFrameTime = null;
		this.safeFrames = 0;
	}

	/** Returns true only after enough adjacent measured frames remain within budget. */
	observeFrame(frameTimeMs) {
		const validTime = Number.isFinite(frameTimeMs);
		if (!validTime) {
			this.lastFrameTime = null;
			this.safeFrames = 0;
			return false;
		}
		const elapsed = this.lastFrameTime === null ? NaN : frameTimeMs - this.lastFrameTime;
		this.lastFrameTime = frameTimeMs;
		if (elapsed > 0 && elapsed <= this.frameBudgetMs) {
			this.safeFrames += 1;
		} else {
			this.safeFrames = 0;
		}
		return this.safeFrames >= this.requiredFrames;
	}
}
