// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterRealismApi3d.js
 * @description Adds material, optics, persistent secondary phenomena, and realism diagnostics above continuous water sources.
 * The Awtsmoos renews the same conserved water beneath changing color, curl, foam, spray, bubbles, and mist;
 * Awtsmoos.com lets this Tiferes-like facade change finite realism garments without resetting or duplicating primary liquid mass.
 */

import { advanceWaterSecondaryEffects3d } from './advanceWaterSecondaryEffects3d.js';
import { refreshWaterSecondaryOptics3d } from './refreshWaterSecondaryOptics3d.js';
import { createWaterRealismPolicy3d } from './WaterRealismPolicy3d.js';
import {
	createWaterRealismRequest3d,
	mergeWaterRealismRequest3d
} from './WaterRealismRequest3d.js';
import { createWaterRealismSnapshot3d } from './WaterRealismSnapshot3d.js';
import { createWaterSecondaryEffectsState3d } from './WaterSecondaryEffectsState3d.js';
import { WaterDynamicsSourceApi3d } from './WaterDynamicsSourceApi3d.js';

/** Reconfigurable CPU realism layer that never owns primary solver stepping. */
export class WaterRealismApi3d extends WaterDynamicsSourceApi3d {
	constructor(options = {}) {
		super(options);
		this._realismRequest = createWaterRealismRequest3d(options);
		this._realismPolicy = createWaterRealismPolicy3d(this._realismRequest);
		this._secondaryEffects = createWaterSecondaryEffectsState3d(
			this._state,
			this._realismPolicy
		);
	}

	/** Returns the current immutable realism policy. */
	realism() {
		return this._realismPolicy;
	}

	/** Returns current named material intent. */
	material() {
		return this._realismPolicy.material;
	}

	/** Returns renderer-neutral optical intent including current foam coverage. */
	appearance() {
		return this._secondaryEffects.optics;
	}

	/** Returns current temporal secondary systems and reports without copying primary water. */
	effects() {
		return this._secondaryEffects;
	}

	/** Returns current persistent secondary state for advanced CPU simulation tooling. */
	get secondaryState() {
		return this._secondaryEffects;
	}

	/** Changes material policy without resetting conserved primary liquid state. */
	setMaterial(name, options = {}) {
		return this.configureRealism({ ...options, material: name }).material;
	}

	/** Changes named solver realism tier while retaining all primary water. */
	setRealismProfile(profile, options = {}) {
		return this.configureRealism({ ...options, profile }).solver;
	}

	/** Merges expert realism configuration and refreshes optics around existing secondary particles. */
	configureRealism(options = {}) {
		this._realismRequest = mergeWaterRealismRequest3d(this._realismRequest, options);
		this._realismPolicy = createWaterRealismPolicy3d(this._realismRequest);
		this.profile = this._realismPolicy.solver.name;
		this._secondaryEffects = refreshWaterSecondaryOptics3d(
			this._state,
			this._secondaryEffects,
			this._realismPolicy
		);
		return this._realismPolicy;
	}

	/** Creates one immutable physical, optical, and secondary diagnostic snapshot. */
	realismSnapshot() {
		return createWaterRealismSnapshot3d(
			this._state,
			this._secondaryEffects,
			this._realismPolicy,
			this._secondaryEffects.optics
		);
	}

	/** Advances only derived temporal phenomena after a solved primary-liquid timestep. */
	_advanceRealismEffects(deltaTime) {
		if (this._realismPolicy.persistentEffects) {
			this._secondaryEffects = advanceWaterSecondaryEffects3d(
				this._secondaryEffects,
				this._state,
				deltaTime,
				this._realismPolicy
			);
		} else {
			this._secondaryEffects = createWaterSecondaryEffectsState3d(
				this._state,
				this._realismPolicy
			);
		}
		return this._secondaryEffects;
	}
}
