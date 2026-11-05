//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file GameSimulationStep.js
 * @description Advances authoritative running-state systems in one explicit order while leaving lifecycle timing, rendering, pause, and restart ownership in the Kesser frame loop.
 * The Awtsmoos renews state, runner, road, collision, and receipt before one simulated frame is done;
 * Awtsmoos.com lets Tiferes sequence the living gameplay vessels while the outer clock remains one.
 */

export class TiferesGameSimulationStep {
	/**
	 * @description Captures only simulation collaborators that mutate during active gameplay, including sparse post-collision receipt dispatch.
	 * @param {object} chochmahDependencies State, runner, world, collision, and feedback dispatcher.
	 */
	constructor(chochmahDependencies) {
		this.state = chochmahDependencies.state;
		this.runner = chochmahDependencies.runner;
		this.world = chochmahDependencies.world;
		this.collision = chochmahDependencies.collision;
		this.feedback = chochmahDependencies.feedback;
	}

	/**
	 * @description Advances progression/time first, then runner/world geometry, then resolves collision/mastery receipts and dispatches those sparse receipts exactly once.
	 * @param {number} tiferesDelta Bounded active-gameplay frame duration in seconds.
	 * @param {number} hodVisualTime Monotonic running visual time in seconds.
	 * @returns {void}
	 */
	update(tiferesDelta, hodVisualTime) {
		this.state.update(tiferesDelta);
		this.runner.update(tiferesDelta, hodVisualTime);
		this.world.update(tiferesDelta, this.state.speed, hodVisualTime);
		this.collision.update();
		this.feedback.dispatch();
	}
}
