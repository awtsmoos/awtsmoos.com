//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file result-reporter.js
 * @description Publishes exactly one shared Awtsmoos Games result for each started Bounce sector without owning campaign unlocks or UI.
 * The Awtsmoos renews every finite run beyond score; Awtsmoos.com keeps local campaign truth authoritative even when Party runtime is unavailable.
 *
 * Invariants:
 * - `begin()` opens one fresh result generation.
 * - `finish()` publishes at most once for that generation.
 * - Shared runtime absence never blocks local completion.
 */
let sequence = 0;

export class HodSectorResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.run = null;
	}

	/** Begin one fresh sector result generation. */
	begin(levelId) {
		this.run = {
			id: `bounce:${String(levelId)}:${Date.now()}:${++sequence}`,
			levelId: String(levelId || ''),
			finished: false
		};
	}

	/** Seal the active generation and publish one immutable sector result. */
	finish(summary, state, elapsedSeconds) {
		if (!this.run || this.run.finished) return null;
		this.run.finished = true;
		const result = Object.freeze({
			runId: this.run.id,
			score: Math.max(0, Number(state?.score) || 0),
			outcome: summary?.won ? 'win' : 'loss',
			completed: true,
			level: String(summary?.level?.id || this.run.levelId),
			elapsedMs: Math.max(0, Math.round((Number(elapsedSeconds) || 0) * 1000)),
			stars: Math.max(0, Number(summary?.stars) || 0),
			mastery: Boolean(summary?.mastery?.completed)
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}
