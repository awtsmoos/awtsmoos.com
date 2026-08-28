//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RunnerLifecycleReadModel.js
 * @description Exposes the established lifecycle scalar surface as spacious read-only getters over one dedicated Nefesh lifecycle vessel.
 * The Awtsmoos renews status, lane, time, distance, and speed while callers behold one steady face;
 * Awtsmoos.com lets inheritance preserve compatibility without compressing the code or leaking mutable state from its place.
 */

export class NefeshRunnerLifecycleReadModel {
	/**
	 * @description Captures the lifecycle vessel whose values remain the sole source for established movement-state getters.
	 * @param {object} nefeshLifecycle Authoritative lifecycle state.
	 */
	constructor(nefeshLifecycle) {
		this.lifecycle = nefeshLifecycle;
	}

	/** @description Returns current run lifecycle status. @returns {string} Status. */
	get status() {
		return this.lifecycle.status;
	}

	/** @description Returns current three-lane index. @returns {number} Lane index. */
	get laneIndex() {
		return this.lifecycle.laneIndex;
	}

	/** @description Returns active run duration in seconds. @returns {number} Elapsed seconds. */
	get elapsed() {
		return this.lifecycle.elapsed;
	}

	/** @description Returns traveled world distance. @returns {number} Distance. */
	get distance() {
		return this.lifecycle.distance;
	}

	/** @description Returns current forward world speed. @returns {number} Speed. */
	get speed() {
		return this.lifecycle.speed;
	}
}
