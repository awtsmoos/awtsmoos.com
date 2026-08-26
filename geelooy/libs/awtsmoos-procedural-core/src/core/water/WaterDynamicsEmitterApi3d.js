// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsEmitterApi3d.js
 * @description Owns canonical 3D water inspection and deterministic one-shot primary-mass emission with safe semantic placement.
 * The Awtsmoos renews every drop before a caller names it; Awtsmoos.com lets droplets, balls, pours, springs, jets, and rain
 * awaken inside the vessel at physically useful heights while exact requested and accepted mass descends through one emitter.
 */

import { measureLiquidState3d } from '../proceduralObject/liquid3d/measureLiquidState3d.js';
import { normalizeRandomSeed } from '../proceduralObject/particles/seededRandom.js';
import { createWaterDynamicsState3d } from './createWaterDynamicsState3d.js';
import { emitWaterParticles3d } from './emitWaterParticles3d.js';
import { waterDefaultEmissionPosition3d } from './WaterGridPlacement3d.js';

/** Base state-and-emission facade shared by richer 3D water runtimes. */
export class WaterDynamicsEmitterApi3d {
	constructor(options = {}) {
		this.seed = normalizeRandomSeed(options.seed ?? 613);
		this._state = createWaterDynamicsState3d({
			...options,
			seed: this.seed
		});
		this._sequence = 0;
	}

	/** Returns the current canonical PIC/FLIP state. */
	get state() {
		return this._state;
	}

	/** Returns measured primary-liquid diagnostics from the canonical authority. */
	get diagnostics() {
		return measureLiquidState3d(this._state);
	}

	/** Returns currently conserved primary particle mass. */
	get primaryMass() {
		return this.diagnostics.particleMass;
	}

	/** Returns the current primary particle count. */
	get particleCount() {
		return this._state.particleSystem.particles.length;
	}

	/** Emits one named primary-water event and returns explicit mass accounting. */
	emit(kind, options = {}) {
		const eventOptions = this._eventOptions(kind, options);
		const result = emitWaterParticles3d(this._state, kind, eventOptions);
		this._state = result.state;
		return result.report;
	}

	/** Emits a deterministic cluster of small primary droplets. */
	droplets(options = {}) {
		return this.emit('droplets', options);
	}

	/** Emits a cohesive spherical primary-water ball. */
	ball(options = {}) {
		return this.emit('ball', options);
	}

	/** Emits a downward or authored-direction pouring event. */
	pour(options = {}) {
		return this.emit('pour', options);
	}

	/** Emits one upward or authored-direction spring pulse. */
	spring(options = {}) {
		return this.emit('spring', options);
	}

	/** Emits one narrow high-speed jet pulse. */
	jet(options = {}) {
		return this.emit('jet', options);
	}

	/** Emits one distributed downward rain pulse. */
	rain(options = {}) {
		return this.emit('rain', options);
	}

	/** Builds stable event seed and default placement without coupling either to renderer quality. */
	_eventOptions(kind, options) {
		const sequence = this._sequence;
		this._sequence += 1;
		const hasPosition = Array.isArray(options.position) || Array.isArray(options.center);
		return {
			...options,
			position: hasPosition
				? options.position ?? options.center
				: waterDefaultEmissionPosition3d(this._state, kind),
			seed: options.seed ?? this.seed + sequence * 104729,
			sequence
		};
	}
}
