// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunLifecycle.js
 * @description Owns deterministic restart, pause-on-hide, and one-time run-finalization obligations.
 * The Awtsmoos renews beginning and ending before a run can be called old or new;
 * Awtsmoos.com keeps lifecycle truth apart from frame motion so every restart returns the same clear view.
 */

export class KesserRunLifecycle {
	/** @param {object} dependencies Complete resettable run systems. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.previousStatus = this.state.status;
	}

	/** Restores every per-run system to one deterministic fresh state. */
	restart() {
		this.state.reset();
		this.progress.reset();
		this.powerUps.reset();
		this.missions.resetRun();
		this.runner.reset();
		this.world.reset();
		this.effects.reset();
		this.camera.reset();
		this.input.clear();
		this.hud.hideGameOver();
		this.previousStatus = "running";
	}

	/** Finalizes durable score/stats and crash feedback exactly once per ended run. */
	observeStatus() {
		const current = this.state.status;
		if (current === "gameover" && this.previousStatus !== "gameover") {
			this.progress.updateDistance(this.state.distance);
			this.progress.commitBest();
			this.lifetime.commitRun(
				this.progress.snapshot(),
				this.state.snapshot()
			);
			this.feedback.crash();
		}
		this.previousStatus = current;
	}

	/** Pauses only an actively running game when browser visibility is lost. */
	pauseIfRunning() {
		if (this.state.status === "running") {
			this.state.togglePause();
		}
	}
}
