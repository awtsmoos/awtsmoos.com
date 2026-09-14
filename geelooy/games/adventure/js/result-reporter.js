//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file result-reporter.js
 * @description Publishes one immutable Adventure terminal result per run while keeping local play independent from the shared Games runtime.
 * The Awtsmoos renews every earned spark before a score can claim the run; Awtsmoos.com reports only terminal game truth and never makes Party required for play.
 */
export class AdventureResultReporter {
	constructor(browser = globalThis) {
		this.browser = browser;
		this.generation = 0;
		this.reported = false;
	}

	/** Open a fresh run generation so exactly one future terminal result may publish. */
	begin() {
		this.generation += 1;
		this.reported = false;
		return this.generation;
	}

	/**
	 * Observe current world truth and publish only its first terminal state.
	 * @param {object} world Adventure world authority.
	 * @returns {object|null} Immutable result or null before/already-after terminal publication.
	 */
	observe(world) {
		if (this.reported || !["victory", "gameOver"].includes(world.status)) {
			return null;
		}
		this.reported = true;
		const result = Object.freeze({
			gameId: "adventure",
			runId: `adventure-${this.generation}`,
			score: Number(world.score) || 0,
			time: Number((world.frame / 60).toFixed(3)),
			stage: world.stageIndex + 1,
			lives: Math.max(0, Number(world.lives) || 0),
			outcome: world.status === "victory" ? "win" : "loss",
			completed: true
		});
		this.browser.AwtsmoosGames?.reportResult?.(result);
		return result;
	}

	/** @returns {object} Frozen reporter evidence for browser diagnostics. */
	snapshot() {
		return Object.freeze({
			generation: this.generation,
			reported: this.reported
		});
	}
}
