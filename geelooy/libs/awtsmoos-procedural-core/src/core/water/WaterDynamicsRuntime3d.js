// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsRuntime3d.js
 * @description Completes unified CPU water with impulses, transfer, one canonical PIC/FLIP step, and post-solve temporal realism.
 * The Awtsmoos renews primary water before foam, spray, bubbles, and mist may testify to its motion;
 * Awtsmoos.com keeps this Gevurah-like runtime faithful to one conserved solver step while derived realism follows afterward.
 */

import { stepParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepParticleGridLiquid3d.js';
import { stepRealisticParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepRealisticParticleGridLiquid3d.js';
import { applyWaterImpulse3d } from './applyWaterImpulse3d.js';
import { extractWaterParcel3d } from './extractWaterParcel3d.js';
import { transferWaterParcel3d } from './transferWaterParcel3d.js';
import { waterGridInteriorCenter3d } from './WaterGridPlacement3d.js';
import { WaterRealismApi3d } from './WaterRealismApi3d.js';

/** Complete stateful CPU orchestration facade above canonical 3D liquid engines. */
export class WaterDynamicsRuntime3d extends WaterRealismApi3d {
	constructor(options = {}) {
		super(options);
		this.profile = options.profile ?? this._realismPolicy.solver.name;
		this.solver = options.solver ?? 'realistic';
		this._lastStep = null;
	}

	/** Returns the complete specialist output from the most recent primary timestep. */
	get lastStep() {
		return this._lastStep;
	}

	/** Applies a localized mass-preserving splash impulse at the water body's interior by default. */
	splash(options = {}) {
		const center = options.center ?? options.position ?? waterGridInteriorCenter3d(this._state);
		const result = applyWaterImpulse3d(this._state, {
			...options,
			center,
			liftImpulse: options.liftImpulse ?? options.lift ?? 1.5
		});
		this._state = result.state;
		return result.report;
	}

	/** Applies radial explosion momentum and optionally creates declared burst mass at the same center. */
	explode(options = {}) {
		const center = options.center ?? options.position ?? waterGridInteriorCenter3d(this._state);
		let spawn = null;
		if (Number(options.spawnMass ?? 0) > 0) {
			spawn = this.emit('burst', {
				...options,
				center,
				mass: options.spawnMass,
				speed: options.burstSpeed ?? 7
			});
		}
		const impulseResult = applyWaterImpulse3d(this._state, { ...options, center });
		this._state = impulseResult.state;
		return Object.freeze({
			impulse: impulseResult.report,
			primaryMass: this.primaryMass,
			spawn
		});
	}

	/** Removes complete primary particles and returns their immutable conserved parcel. */
	drain(options = {}) {
		const result = extractWaterParcel3d(this._state, options);
		this._state = result.state;
		return result.parcel;
	}

	/** Moves exact primary mass to another runtime, relocating into its vessel unless coordinates are authored. */
	transferTo(target, options = {}) {
		if (!(target instanceof WaterDynamicsRuntime3d)) {
			throw new TypeError('B"H | transferTo requires another WaterDynamicsRuntime3d.');
		}
		const hasRelocation = Array.isArray(options.targetCenter) || Array.isArray(options.offset);
		const transferOptions = hasRelocation
			? options
			: { ...options, targetCenter: waterGridInteriorCenter3d(target._state) };
		const result = transferWaterParcel3d(this._state, target._state, transferOptions);
		this._state = result.sourceState;
		target._state = result.targetState;
		return result.report;
	}

	/** Advances sources, exactly one primary solver step, then derived temporal realism. */
	step(deltaTime = 1 / 60, options = {}) {
		this._emitContinuousSources(deltaTime);
		const stepOptions = { ...options, deltaTime };
		const useBaseSolver = (options.solver ?? this.solver) === 'base';
		const realism = resolveStepRealism(options, this._realismPolicy.solver);
		const output = useBaseSolver
			? stepParticleGridLiquid3d(this._state, stepOptions)
			: stepRealisticParticleGridLiquid3d(this._state, {
				...stepOptions,
				realism
			});
		this._state = output.state;
		this._lastStep = output;
		this._advanceRealismEffects(deltaTime);
		return output;
	}
}

function resolveStepRealism(options, fallback) {
	if (options.realism !== undefined) {
		return options.realism;
	}
	if (options.profile !== undefined) {
		return options.profile;
	}
	return fallback;
}
