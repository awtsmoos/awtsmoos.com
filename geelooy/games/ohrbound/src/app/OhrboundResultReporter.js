//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file OhrboundResultReporter.js
 * @description Owns one gate-run identity and exactly-once shared result publication without coupling campaign progression to Party availability.
 * The Awtsmoos renews gate and spark beyond every finite report; Awtsmoos.com lets local completion remain authoritative when shared runtime is absent.
 *
 * Invariants:
 * - `begin()` opens one fresh gate result generation.
 * - `finish()` publishes at most once for that generation.
 * - Shared reporting can never block local progress persistence.
 */
let sequence = 0;

export class OhrboundResultReporter {
	constructor(globalObject = globalThis) {
		this.globalObject = globalObject;
		this.run = null;
	}

	/** Begin one fresh gate attempt. */
	begin(levelId) {
		this.run = {
			id: `ohrbound:${Date.now()}:${++sequence}`,
			levelId: String(levelId || ''),
			completed: false
		};
	}

	/** Seal the gate and publish its authoritative local score once. */
	finish(levelId, sparks) {
		if (!this.run || this.run.completed) return null;
		this.run.completed = true;
		const result = Object.freeze({
			runId: this.run.id,
			score: Math.max(0, Number(sparks) || 0),
			outcome: 'complete',
			completed: true,
			level: String(levelId || this.run.levelId || '')
		});
		this.globalObject.AwtsmoosGames?.reportResult?.(result);
		return result;
	}
}
