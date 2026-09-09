//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file run-session.js
 * @description Owns KAVANAH run identity, active-play timing, composed pause reasons, and exactly-once shared result publication.
 * The Awtsmoos renews every instant beyond time; Awtsmoos.com counts only deliberate active play and seals each finite run once.
 *
 * Invariants:
 * - A run cannot complete twice.
 * - Independent pause reasons compose instead of accidentally resuming one another.
 * - Background time is excluded from elapsed play duration.
 * - Missing shared Games runtime never blocks local retry or result presentation.
 */
let sequence = 0;

export class KavanahRunSession {
	constructor(globalObject = globalThis, now = () => performance.now()) {
		this.globalObject = globalObject;
		this.now = now;
		this.pauseReasons = new Set();
		this.run = null;
	}

	/** Begin one fresh run and discard every pause reason from the prior generation. */
	begin() {
		this.pauseReasons.clear();
		this.run = {
			id: `kavanah:${Date.now()}:${++sequence}`,
			startedAt: this.now(),
			pausedAt: null,
			pausedMs: 0,
			completed: false
		};
		return this.run.id;
	}

	/** Set one pause reason and return the resulting aggregate paused state. */
	setPaused(reason, active) {
		if (!this.run || this.run.completed) return this.paused;
		const before = this.paused;
		if (active) this.pauseReasons.add(reason);
		else this.pauseReasons.delete(reason);
		const after = this.paused;
		if (!before && after) this.run.pausedAt = this.now();
		if (before && !after && this.run.pausedAt !== null) {
			this.run.pausedMs += Math.max(0, this.now() - this.run.pausedAt);
			this.run.pausedAt = null;
		}
		return after;
	}

	/** Whether any lifecycle source currently suspends simulation. */
	get paused() {
		return this.pauseReasons.size > 0;
	}

	/** Whether a live unfinished generation exists and may simulate. */
	get active() {
		return Boolean(this.run && !this.run.completed);
	}

	/** Return active-play elapsed milliseconds with current pause time excluded. */
	elapsedMs() {
		if (!this.run) return 0;
		const end = this.run.completed ? this.run.completedAt : this.now();
		const openPause = this.run.pausedAt === null ? 0 : Math.max(0, end - this.run.pausedAt);
		return Math.max(0, Math.round(end - this.run.startedAt - this.run.pausedMs - openPause));
	}

	/** Seal and publish one canonical defeat/completion result exactly once. */
	finish(score, phase, outcome = 'defeat') {
		if (!this.run || this.run.completed) return null;
		this.run.completedAt = this.now();
		this.run.completed = true;
		const result = Object.freeze({
			runId: this.run.id,
			score: Math.max(0, Number(score) || 0),
			elapsedMs: this.elapsedMs(),
			outcome,
			completed: true,
			level: Math.max(1, Number(phase?.index) + 1 || 1)
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}
