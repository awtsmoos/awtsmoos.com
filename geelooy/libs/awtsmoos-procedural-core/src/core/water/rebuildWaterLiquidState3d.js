// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rebuildWaterLiquidState3d.js
 * @description Reconciles externally changed primary particles back into the canonical PIC/FLIP grid immediately.
 * The Awtsmoos renews particle and grid as one liquid witness; Awtsmoos.com uses this Yesod-like bridge so emitted,
 * drained, transferred, or impulsed water never leaves conserved mass in one representation while another tells a different story.
 */

import { createParticleGridLiquidState } from '../proceduralObject/liquid3d/createParticleGridLiquidState.js';
import { transferParticlesToGrid3d } from '../proceduralObject/liquid3d/transferParticlesToGrid3d.js';
import { createParticleSystem } from '../proceduralObject/particles/createParticleSystem.js';

/** Rebuilds canonical liquid state and grid mass/momentum from a particle system or particle array. */
export function rebuildWaterLiquidState3d(state, particleInput = state.particleSystem) {
	const particleSystem = createParticleSystem(Array.isArray(particleInput)
		? { ...state.particleSystem, particles: particleInput }
		: particleInput);
	const transfer = transferParticlesToGrid3d(particleSystem, state.grid);
	return createParticleGridLiquidState({
		...state,
		grid: state.grid,
		massGrid: transfer.massGrid,
		particleSystem,
		previousVelocityGrid: transfer.velocityGrid,
		velocityGrid: transfer.velocityGrid
	});
}
