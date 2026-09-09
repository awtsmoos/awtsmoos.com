//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file result-reporter.js
 * @description Owns Emoji War run identity, active-play timing, and exactly-once shared result publication without depending on menu DOM.
 * The Awtsmoos renews every finite score and wave; Awtsmoos.com seals each Arcade or Caption Remix run once while excluding deliberate/background pause time.
 *
 * Invariants:
 * - `begin()` creates one fresh run identity.
 * - Pause intervals never inflate active elapsed time.
 * - `finish()` publishes at most once for that identity.
 * - Score, wave, and elapsed time are finite and nonnegative.
 */
let sequence = 0;

export class EmojiResultReporter {
	constructor(globalObject = globalThis, now = () => performance.now()) {
		this.globalObject = globalObject;
		this.now = now;
		this.run = null;
	}

	/** Begin one fresh Arcade or Caption Remix result generation. */
	begin(custom) {
		this.run = {
			id: `emoji-war:${Date.now()}:${++sequence}`,
			startedAt: this.now(),
			pausedAt: null,
			pausedMs: 0,
			custom: Boolean(custom),
			completed: false
		};
		return this.run.id;
	}

	/** Mirror aggregate pause truth so elapsed time measures only active gameplay. */
	setPaused(paused) {
		if (!this.run || this.run.completed) return false;
		const now = this.now();
		if (paused && this.run.pausedAt === null) {
			this.run.pausedAt = now;
			return true;
		}
		if (!paused && this.run.pausedAt !== null) {
			this.run.pausedMs += Math.max(0, now - this.run.pausedAt);
			this.run.pausedAt = null;
		}
		return this.run.pausedAt !== null;
	}

	/** Seal one completed run and publish its canonical score/wave result exactly once. */
	finish(score, wave) {
		if (!this.run || this.run.completed) return null;
		const finishedAt = this.now();
		const livePause = this.run.pausedAt === null
			? 0
			: Math.max(0, finishedAt - this.run.pausedAt);
		this.run.completed = true;
		const elapsedMs = finishedAt
			- this.run.startedAt
			- this.run.pausedMs
			- livePause;
		const result = Object.freeze({
			runId: this.run.id,
			score: Math.max(0, Number(score) || 0),
			elapsedMs: Math.max(0, Math.round(elapsedMs)),
			outcome: 'defeat',
			completed: true,
			level: Math.max(1, Number(wave) || 1),
			mode: this.run.custom ? 'caption-remix' : 'arcade'
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}
