// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file advanceWaterSecondaryEffects3d.js
 * @description Advances persistent spray, foam, bubbles, and mist from already-solved primary liquid without stepping PIC/FLIP again.
 * The Awtsmoos renews aftermath after motion, echo after cause; Awtsmoos.com lets gravity pull spray, bubbles rise,
 * foam linger, and mist drift under budgets while conserved primary water remains wholly beneath its single solver law.
 */

import { createLiquidOpticalProfile3d } from '../proceduralObject/realtimeRealism/createLiquidOpticalProfile3d.js';
import { createLiquidSecondaryParticleSystems3d } from '../proceduralObject/realtimeRealism/createLiquidSecondaryParticleSystems3d.js';
import { advanceSecondaryParticleSystem3d } from '../proceduralObject/realtimeRealism/persistent/advanceSecondaryParticleSystem3d.js';
import { mergeSecondaryParticleSystems3d } from '../proceduralObject/realtimeRealism/persistent/mergeSecondaryParticleSystems3d.js';
import { liquidDomainBounds } from '../proceduralObject/realtimeRealism/persistent/secondaryParticleBounds.js';
import { secondaryCounts } from './WaterSecondaryEffectsState3d.js';

const ROLES = Object.freeze(['spray', 'foam', 'bubble', 'mist']);

/** Advances derived secondary systems against one solved primary state. */
export function advanceWaterSecondaryEffects3d(previous, liquidState, deltaTime, policy) {
	const dt = Math.max(1e-6, Number(deltaTime) || 1 / 60);
	const nextTime = previous.time + dt;
	const bounds = liquidDomainBounds(liquidState, 0);
	const emitted = createLiquidSecondaryParticleSystems3d(
		liquidState,
		policy.secondaryParticles
	).systems;
	const systems = {};
	for (const role of ROLES) {
		const advanced = advanceSecondaryParticleSystem3d(
			previous.secondarySystems[role],
			role,
			dt,
			nextTime,
			bounds,
			policy.secondaryDynamics
		);
		systems[role] = mergeSecondaryParticleSystems3d(
			advanced,
			emitted[role],
			role,
			policy.budgets
		);
	}
	const counts = secondaryCounts(systems);
	const primaryCount = Math.max(1, liquidState.particleSystem.particles.length);
	return Object.freeze({
		frame: previous.frame + 1,
		optics: createLiquidOpticalProfile3d(liquidState, {
			...policy.optics,
			foamCoverage: counts.foam / primaryCount
		}),
		report: Object.freeze({
			counts,
			emitted: secondaryCounts(emitted)
		}),
		schema: previous.schema,
		secondarySystems: Object.freeze(systems),
		time: nextTime
	});
}
