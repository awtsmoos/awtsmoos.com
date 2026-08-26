// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBodyRuntime.js
 * @description Adds self-identifying pond, lake, wetland, and runoff semantics above the mature shallow-water runtime.
 * The Awtsmoos renews the same water beneath every friendly name without multiplying the hidden machine;
 * Awtsmoos.com lets one proven runtime own rain, springs, drains, and stepping while semantic Nature remains simple and clean.
 */

import { createShallowWaterDiagnostics } from '../proceduralObject/simulation/shallowWaterDiagnostics.js';
import { sampleShallowWater } from '../proceduralObject/simulation/sampleShallowWater.js';
import { fromShallowWaterSample } from '../physics/fluid/FluidInteractionSample.js';
import { ShallowWaterRuntime } from '../water/ShallowWaterRuntime.js';
import { createWaterBodyRecipe } from './WaterBodyRecipe.js';

/** Semantic shallow-water runtime that preserves one friendly body identity above canonical flow state. */
export class MalchusWaterBodyRuntime {
	constructor(options = {}) {
		this.recipe = createWaterBodyRecipe(options);
		this.runtime = createRuntime(this.recipe);
	}

	/** Returns the immutable semantic body kind chosen by the canonical recipe. */
	get kind() {
		return this.recipe.kind;
	}

	/** Returns current canonical shallow-water state. */
	get state() {
		return this.runtime.state;
	}

	/** Returns persistent source snapshots delegated from the shallow runtime. */
	get sources() {
		return this.runtime.sources;
	}

	/** Advances the mature shallow-water runtime without duplicating numerical orchestration. */
	advance(deltaSeconds = 1 / 60, forcing = {}) {
		return this.runtime.step(deltaSeconds, forcing);
	}

	/** Returns one immutable solver-neutral gameplay/ecology sample. */
	sample(worldX, worldY) {
		return fromShallowWaterSample(sampleShallowWater(this.state, worldX, worldY));
	}

	/** Exposes immutable numerical evidence for debugging and quality policy. */
	diagnostics() {
		return createShallowWaterDiagnostics(this.state);
	}

	/** Delegates rainfall to the mature shallow-water source runtime. */
	rain(rate = 0) {
		return this.runtime.rain(rate);
	}

	/** Adds one persistent source or sink using the mature runtime registry. */
	addSource(options = {}) {
		return this.runtime.addSource(options);
	}

	/** Adds one positive inflow with the mature runtime's spring defaults. */
	spring(options = {}) {
		return this.runtime.spring(options);
	}

	/** Adds one negative source with the mature runtime's drain defaults. */
	drain(options = {}) {
		return this.runtime.drain(options);
	}

	/** Removes one authored source without rebuilding the semantic recipe. */
	stopSource(id) {
		return this.runtime.stopSource(id);
	}

	/** Recreates the initial semantic body while preserving the immutable recipe. */
	reset() {
		this.runtime = createRuntime(this.recipe);
		return this.state;
	}
}

/** Creates one semantic water-body runtime. */
export function createWaterBodyRuntime(options = {}) {
	return new MalchusWaterBodyRuntime(options);
}

function createRuntime(recipe) {
	return new ShallowWaterRuntime(recipe.toStateInput());
}
