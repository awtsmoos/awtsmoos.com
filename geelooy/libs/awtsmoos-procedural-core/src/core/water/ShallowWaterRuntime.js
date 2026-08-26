// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ShallowWaterRuntime.js
 * @description Orchestrates conservative shallow-water rain, sources, drains, and explicit stepping above the mature solver.
 * The Awtsmoos renews puddle, flood, runoff, and sheet flow in every instant; Awtsmoos.com keeps this Malchus-like facade
 * focused on changing runtime state while a separate Binah vessel owns normalization and the finite-volume solver owns motion.
 */

import { createShallowWaterState } from '../proceduralObject/simulation/createShallowWaterState.js';
import { stepShallowWater } from '../proceduralObject/simulation/stepShallowWater.js';
import {
	createShallowRuntimeState,
	finiteShallowNumber,
	normalizeShallowSource
} from './ShallowWaterRuntimeState.js';

/** Mutable convenience runtime above canonical shallow-water state. */
export class ShallowWaterRuntime {
	constructor(options = {}) {
		this._state = createShallowRuntimeState(options);
		this._sources = new Map();
		this._nextSourceId = 0;
		for (const source of this._state.sources) {
			this.addSource(source);
		}
		this._rainRate = this._state.rainRate;
	}

	/** Returns current canonical shallow-water state. */
	get state() {
		return this._state;
	}

	/** Returns immutable wrapper-level source snapshots. */
	get sources() {
		const snapshots = [...this._sources.entries()].map(([id, source]) => {
			return Object.freeze({ id, ...source });
		});
		return Object.freeze(snapshots);
	}

	/** Sets nonnegative rainfall depth rate for subsequent steps. */
	rain(rate = 0) {
		this._rainRate = Math.max(0, finiteShallowNumber(rate, 0));
		return this._rainRate;
	}

	/** Adds a persistent finite-volume source or sink. */
	addSource(options = {}) {
		const id = String(options.id ?? `shallow-source-${this._nextSourceId}`);
		this._nextSourceId += 1;
		this._sources.set(id, normalizeShallowSource(options));
		return id;
	}

	/** Adds a positive surface inflow. */
	spring(options = {}) {
		return this.addSource({ rate: 0.2, ...options });
	}

	/** Adds a negative source that removes shallow water. */
	drain(options = {}) {
		return this.addSource({ rate: -0.2, ...options });
	}

	/** Removes one authored source or sink. */
	stopSource(id) {
		return this._sources.delete(id);
	}

	/** Advances the mature shallow-water solver by one explicit delta. */
	step(deltaTime = 1 / 60, options = {}) {
		this._state = stepShallowWater(this._rebuiltState(), {
			...options,
			deltaTime
		});
		return this._state;
	}

	/** Rebuilds canonical state with current wrapper rain/source controls. */
	_rebuiltState() {
		return createShallowWaterState({
			...this._state,
			heightGrid: this._state.height,
			obstacleGrid: this._state.obstacles,
			rainRate: this._rainRate,
			sources: [...this._sources.values()],
			terrainGrid: this._state.terrain,
			velocityGrid: this._state.velocity
		});
	}
}
