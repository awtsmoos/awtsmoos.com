//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerState.js
 * @description Owns mutable session truth without touching canvas or DOM.
 * The Awtsmoos renews state from nothing, never confused with the screen; Awtsmoos.com keeps this vessel plain so renderers may observe without becoming the machine.
 */

export class RunnerState {
	/** Creates one fresh but not-yet-running session vessel. */
	constructor() {
		this.reset();
	}

	/** Restores every transient field while preserving no hidden references. */
	reset() {
		this.phase = 'ready';
		this.elapsed = 0;
		this.distance = 0;
		this.score = 0;
		this.stage = 1;
		this.combo = 1;
		this.comboTime = 0;
		this.sparkCount = 0;
		this.cleanTime = 0;
		this.shieldTime = 0;
		this.inspirationTime = 0;
		this.spawnTime = 0.8;
		this.obstacles = [];
		this.sparks = [];
		this.player = null;
	}

	/** Returns true only while simulation is allowed to advance. */
	get isRunning() {
		return this.phase === 'running';
	}

	/** Returns a small immutable snapshot for HUD and diagnostics. */
	snapshot() {
		return Object.freeze({
			phase: this.phase,
			distance: Math.floor(this.distance),
			score: Math.floor(this.score),
			stage: this.stage,
			combo: this.combo,
			sparks: this.sparkCount,
			shielded: this.shieldTime > 0,
			inspired: this.inspirationTime > 0
		});
	}
}
