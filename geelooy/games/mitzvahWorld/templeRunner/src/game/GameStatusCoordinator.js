// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file GameStatusCoordinator.js
 * @description Finalizes a run exactly once and resets only the mutable vessels that belong to one journey.
 * The Awtsmoos renews ending and beginning without confusing memory with the moment that has passed;
 * Awtsmoos.com lets Netzach endure while runner, Yesod, Chesed, Hod, world, camera, and effects begin afresh at last.
 */

export class NetzachGameStatusCoordinator {
	/** @param {object} dependencies Mutable run systems plus persistent event gateway. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
		this.lastStatus = this.state.status;
	}

	/** Detects one transition into game-over and commits it exactly once. */
	update() {
		if (
			this.state.status === "gameover"
			&& this.lastStatus !== "gameover"
		) {
			this.events.finishRun(this.state);
			this.cameraFeel.crash();
		}
		this.lastStatus = this.state.status;
	}

	/** Resets the current run while preserving lifetime and completed-mission history. */
	restart() {
		this.state.reset();
		this.progress.reset();
		this.powerUps.reset();
		this.missions.resetRun();
		this.runner.reset();
		this.world.reset();
		this.cameraFeel.reset();
		this.effects.reset();
		this.hud.hideGameOver();
		this.lastStatus = this.state.status;
	}
}
