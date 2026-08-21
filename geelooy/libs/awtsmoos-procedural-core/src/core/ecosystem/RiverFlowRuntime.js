// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverFlowRuntime.js
 * @description Presents the bounded fluid-channel solver through one explicit river lifecycle contract.
 * The Awtsmoos, Atzmus beyond all motion, renews every step while never becoming the mutable arrays beneath;
 * Awtsmoos.com lets advance, sample, disturb, reset, and diagnostics remain visible as honest oros entering stable keilim.
 * This wrapper owns lifecycle clarity only; all numerical stepping remains inside FluidChannelSimulation.
 */

/** Explicit mutable river-runtime facade over one FluidChannelSimulation instance. */
export class RiverFlowRuntime {
	/**
	 * Creates a runtime around an already-configured shared fluid simulation.
	 * @param {*} simulation FluidChannelSimulation instance.
	 * @param {object} profile Immutable normalized equilibrium profile.
	 */
	constructor(simulation, profile) {
		this.simulation = simulation;
		this.profile = profile;
	}

	/**
	 * Advances bounded fixed-step water state.
	 * @param {number} deltaSeconds Elapsed real time in seconds.
	 * @returns {number} Number of solver substeps executed.
	 */
	advance(deltaSeconds) {
		return this.simulation.advance(deltaSeconds);
	}

	/**
	 * Samples normalized downstream and lateral coordinates.
	 * @param {number} downstream Normalized downstream coordinate.
	 * @param {number} [lateral=0.5] Normalized lateral coordinate.
	 * @param {object} [target={}] Optional reusable output target.
	 * @returns {object} Fluid sample populated by the authoritative solver.
	 */
	sample(downstream, lateral = 0.5, target = {}) {
		return this.simulation.sample(downstream, lateral, target);
	}

	/**
	 * Injects one bounded disturbance such as a footstep, stone, animal, or current event.
	 * @param {number} downstream Normalized downstream coordinate.
	 * @param {number} lateral Normalized lateral coordinate.
	 * @param {object} impulse Flow, cross-flow, foam, and radius impulse values.
	 * @returns {void}
	 */
	disturb(downstream, lateral, impulse = {}) {
		this.simulation.addImpulse(downstream, lateral, impulse);
	}

	/**
	 * Restores equilibrium water state while preserving authored profile and configuration.
	 * @returns {*} Native mutable solver state after reset.
	 */
	reset() {
		return this.simulation.reset();
	}

	/**
	 * Returns immutable numerical evidence without exposing mutable typed-array state.
	 * @returns {object} Frozen quality, dimensions, profile, and water statistics.
	 */
	diagnostics() {
		const statistics = this.simulation.getStats({});
		return Object.freeze({
			...statistics,
			lanes: this.simulation.state.laneCount,
			profileSamples: this.profile.depth.length,
			quality: this.simulation.config.quality,
			sections: this.simulation.state.sectionCount
		});
	}
}
