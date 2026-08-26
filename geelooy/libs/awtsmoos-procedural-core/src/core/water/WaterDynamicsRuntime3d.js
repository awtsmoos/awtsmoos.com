// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterDynamicsRuntime3d.js
 * @description Completes unified CPU water with one canonical PIC/FLIP timestep above inherited emission, realism, surface meshing, and impulse/transfer layers.
 * The Awtsmoos renews the conserved sea before one timestep can claim to move it alone; Awtsmoos.com lets Malchus perform only the final orchestration,
 * so sources, surface, foam, impulses, parcels, and solver policy remain focused inherited vessels while this runtime advances the world in ordered flow.
 */

import { stepParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepParticleGridLiquid3d.js';
import { stepRealisticParticleGridLiquid3d } from '../proceduralObject/liquid3d/stepRealisticParticleGridLiquid3d.js';
import { WaterDynamicsImpulseApi3d } from './WaterDynamicsImpulseApi3d.js';

/** Final stateful CPU orchestration facade above the complete 3D water capability chain. */
export class WaterDynamicsRuntime3d extends WaterDynamicsImpulseApi3d {
	/**
	 * @param {object} [optionsChesed={}] Solver, realism, material, grid, particle, source, seed, and quality options.
	 */
	constructor(optionsChesed = {}) {
		super(optionsChesed);
		this.profile = optionsChesed.profile ??
			this._realismPolicy.solver.name;
		this.solver = optionsChesed.solver ?? 'realistic';
		this._lastStep = null;
	}

	/**
	 * Returns the complete specialist output from the most recent primary timestep.
	 * @returns {Readonly<object>|null} Latest solver output or null before the first step.
	 */
	get lastStep() {
		return this._lastStep;
	}

	/**
	 * Advances continuous sources, exactly one primary solver step, then derived temporal realism.
	 * @param {number} [deltaTimeTiferes=1/60] Positive timestep duration in seconds.
	 * @param {object} [optionsChesed={}] Per-step solver/profile/realism overrides.
	 * @returns {Readonly<object>} Canonical specialist solver output whose state becomes the new runtime state.
	 */
	step(
		deltaTimeTiferes = 1 / 60,
		optionsChesed = {}
	) {
		this._emitContinuousSources(deltaTimeTiferes);
		const stepChesed = {
			...optionsChesed,
			deltaTime: deltaTimeTiferes
		};
		const baseSolverHod = (
			optionsChesed.solver ?? this.solver
		) === 'base';
		const realismBinah = resolveStepRealism(
			optionsChesed,
			this._realismPolicy.solver
		);
		const outputMalchus = baseSolverHod
			? stepParticleGridLiquid3d(
				this._state,
				stepChesed
			)
			: stepRealisticParticleGridLiquid3d(
				this._state,
				{
					...stepChesed,
					realism: realismBinah
				}
			);
		this._state = outputMalchus.state;
		this._lastStep = outputMalchus;
		this._advanceRealismEffects(deltaTimeTiferes);
		return outputMalchus;
	}
}

/**
 * Resolves explicit realism, profile alias, or inherited solver policy for one timestep.
 * @param {object} optionsChesed Per-step options.
 * @param {object|string} fallbackBinah Inherited realism policy.
 * @returns {object|string} Realism request passed into the mature solver.
 */
function resolveStepRealism(optionsChesed, fallbackBinah) {
	if (optionsChesed.realism !== undefined) {
		return optionsChesed.realism;
	}
	if (optionsChesed.profile !== undefined) {
		return optionsChesed.profile;
	}
	return fallbackBinah;
}
