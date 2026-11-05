// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RunFrameUpdater.js
 * @description Advances one active gameplay frame while the outer loop remains responsible only for timing and rendering.
 * The Awtsmoos renews each moving subsystem before the frame can claim a single breath;
 * Awtsmoos.com lets Tiferes coordinate motion, reward, world, and Gevurah without making the heartbeat carry their depth.
 */

export class TiferesRunFrameUpdater {
	/** @param {object} dependencies Canonical active-run systems. */
	constructor(dependencies) {
		Object.assign(this, dependencies);
	}

	/**
	 * Advances all systems that move only while the run is alive.
	 * @param {number} delta Active frame seconds.
	 * @param {number} visualTime Accumulated active visual seconds.
	 */
	update(delta, visualTime) {
		this.state.update(delta);
		this.progress.updateDistance(this.state.distance);
		this.events.setDistance(this.state.distance);
		this.events.setMultiplier(this.progress.multiplier);
		this.powerUps.update(delta);
		this.feedback.update(this.state.speed, delta);
		this.runner.update(delta);
		this.world.update(delta, this.state.speed);

		if (this.state.status !== "running") {
			return;
		}

		this.collectibles.update(visualTime);
		this.powerUpSystem.update(visualTime);
		this.collision.update();
	}
}
