// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsRuntime3d.js
 * @description Completes the unified 3D water language with vessel-aware impulses, explosion, drain, transfer, and real PIC/FLIP stepping.
 * The Awtsmoos renews every motion without confusing motion with substance; Awtsmoos.com lets this Gevurah-like runtime
 * preserve mass through splash, transfer, and timestep while proven incompressible solvers alone decide how the liquid flows.
 */

import { stepParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepParticleGridLiquid3d.js';
import { stepRealisticParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepRealisticParticleGridLiquid3d.js';
import { applyWaterImpulse3d } from './applyWaterImpulse3d.js';
import { extractWaterParcel3d } from './extractWaterParcel3d.js';
import { transferWaterParcel3d } from './transferWaterParcel3d.js';
import { waterGridInteriorCenter3d } from './WaterGridPlacement3d.js';
import { WaterDynamicsSourceApi3d } from './WaterDynamicsSourceApi3d.js';

/** Complete stateful orchestration facade above canonical 3D liquid engines. */
export class WaterDynamicsRuntime3d extends WaterDynamicsSourceApi3d {
	constructor(options = {}) {
		super(options);
		this.profile = options.profile ?? 'balanced';
		this.solver = options.solver ?? 'realistic';
		this._lastStep = null;
	}

	/** Returns the complete specialist output from the most recent timestep. */
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

	/** Applies radial explosion momentum and optionally creates explicitly declared burst mass at the same center. */
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

	/** Moves exact primary mass to another 3D water runtime, relocating into its vessel unless coordinates are authored. */
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

	/** Advances continuous sources and then delegates bulk flow to the chosen canonical liquid solver. */
	step(deltaTime = 1 / 60, options = {}) {
		this._emitContinuousSources(deltaTime);
		const stepOptions = { ...options, deltaTime };
		const useBaseSolver = (options.solver ?? this.solver) === 'base';
		const output = useBaseSolver
			? stepParticleGridLiquid3d(this._state, stepOptions)
			: stepRealisticParticleGridLiquid3d(this._state, {
				...stepOptions,
				profile: options.profile ?? this.profile
			});
		this._state = output.state;
		this._lastStep = output;
		return output;
	}
}
