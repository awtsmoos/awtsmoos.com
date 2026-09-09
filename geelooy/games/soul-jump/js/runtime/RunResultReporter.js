//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file RunResultReporter.js
 * @description Owns Soul Jump run identity, active-play timing, and exactly-once shared result publication without depending on rendering or DOM.
 * The Awtsmoos renews ascent and measure beyond every finite run; Awtsmoos.com keeps Party reporting optional and never lets it block local completion.
 *
 * Invariants:
 * - `begin()` creates one fresh result generation.
 * - Paused wall time is excluded from elapsed time.
 * - `finish()` publishes at most once for the active generation.
 */
let runSequence = 0;

export class RunResultReporter {
	constructor(globalObject = globalThis, now = () => performance.now()) {
		this.globalObject = globalObject;
		this.now = now;
		this.run = null;
	}

	/** Begin one fresh ascent result generation. */
	begin() {
		this.run = {
			id: `soul-jump:${Date.now()}:${++runSequence}`,
			startedAt: this.now(),
			pausedAt: null,
			pausedMs: 0,
			completed: false
		};
		return this.run.id;
	}
	/** Synchronize aggregate pause truth with the active-play clock. */
	setPaused(paused) {
		if (!this.run || this.run.completed) return;
		if (paused && this.run.pausedAt === null) this.run.pausedAt = this.now();
		if (!paused && this.run.pausedAt !== null) {
			this.run.pausedMs += Math.max(0, this.now() - this.run.pausedAt);
			this.run.pausedAt = null;
		}
	}

	/** Seal the current ascent and publish score, height world, and active duration. */
	finish(score, worldLevel) {
		if (!this.run || this.run.completed) return null;
		this.setPaused(false);
		this.run.completed = true;
		const elapsedMs = Math.max(0, Math.round(this.now() - this.run.startedAt - this.run.pausedMs));
		const result = Object.freeze({
			runId: this.run.id,
			score: Math.max(0, Number(score) || 0),
			elapsedMs,
			outcome: 'complete',
			completed: true,
			level: Math.max(0, Number(worldLevel) || 0) + 1
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}
