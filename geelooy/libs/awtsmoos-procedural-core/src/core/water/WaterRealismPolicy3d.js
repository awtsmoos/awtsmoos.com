// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterRealismPolicy3d.js
 * @description Composes named water material, CPU realism tier, optics, secondary thresholds, and deterministic persistence budgets.
 * The Awtsmoos renews law and appearance without confusing either with substance; Awtsmoos.com joins these finite policies
 * above PIC/FLIP so expert overrides win while mass, seed, and primary topology remain untouched beneath their light.
 */

import { createLiquidRealismProfile3d } from '../proceduralObject/liquid3d/createLiquidRealismProfile3d.js';
import { freezeWaterValue } from './freezeWaterValue.js';
import { waterMaterialProfile3d } from './WaterMaterialProfiles3d.js';

const BUDGETS = Object.freeze({ realtime: 96, balanced: 256, cinematic: 768, extreme: 1536 });

/** Resolves one immutable CPU realism policy for a unified 3D water runtime. */
export function createWaterRealismPolicy3d(options = {}) {
	const profileName = requestedProfile(options);
	const material = waterMaterialProfile3d(options.material ?? 'fresh');
	const base = createLiquidRealismProfile3d(profileName);
	const dynamics = material.dynamics;
	const solver = createLiquidRealismProfile3d({
		...base,
		cohesion: base.cohesion * dynamics.cohesionScale,
		foamVorticity: base.foamVorticity * dynamics.foamThresholdScale,
		profile: base.name,
		spraySpeed: base.spraySpeed * dynamics.spraySpeedScale,
		viscosity: base.viscosity * dynamics.viscosityScale,
		vorticity: base.vorticity * dynamics.vorticityScale,
		...expertRealism(options.realism)
	});
	const defaultBudget = BUDGETS[base.name] ?? BUDGETS.balanced;
	return Object.freeze({
		budgets: freezeWaterValue({
			maximumPerRole: defaultBudget,
			...(options.budgets ?? {})
		}),
		material,
		optics: freezeWaterValue({ ...material.optics, ...(options.optics ?? {}) }),
		persistentEffects: options.persistentEffects ?? base.name !== 'realtime',
		secondaryDynamics: freezeWaterValue(options.secondaryDynamics ?? {}),
		secondaryParticles: freezeWaterValue({
			fastSpeed: Math.max(0.1, solver.spraySpeed * 0.45),
			sparseNeighbors: Math.max(3, Math.round(solver.restNeighbors * 0.28)),
			surfaceHeight: 0.72,
			turbulence: Math.max(0.05, solver.foamVorticity * 0.32),
			...(options.secondaryParticles ?? {})
		}),
		solver
	});
}

function requestedProfile(options) {
	if (typeof options.realism === 'string') {
		return options.realism;
	}
	return options.profile ?? 'balanced';
}

function expertRealism(realism) {
	if (realism && typeof realism === 'object' && !Array.isArray(realism)) {
		return realism;
	}
	return {};
}
