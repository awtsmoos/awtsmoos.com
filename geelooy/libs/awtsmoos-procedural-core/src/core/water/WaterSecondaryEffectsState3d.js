// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterSecondaryEffectsState3d.js
 * @description Creates temporal spray, foam, bubble, and mist state derived from primary water without consuming conserved mass.
 * The Awtsmoos renews every secondary witness after the water itself exists; Awtsmoos.com keeps these shimmering particles
 * in a separate vessel so foam may linger and mist may drift while not one derived speck pretends to be primary liquid.
 */

import { createLiquidOpticalProfile3d } from '../proceduralObject/realtimeRealism/createLiquidOpticalProfile3d.js';
import { createLiquidSecondaryParticleSystems3d } from '../proceduralObject/realtimeRealism/createLiquidSecondaryParticleSystems3d.js';

/** Creates one immutable secondary-effects state from an already canonical liquid state. */
export function createWaterSecondaryEffectsState3d(liquidState, policy) {
	const systems = createLiquidSecondaryParticleSystems3d(
		liquidState,
		policy.secondaryParticles
	).systems;
	const counts = secondaryCounts(systems);
	const primaryCount = Math.max(1, liquidState.particleSystem.particles.length);
	return Object.freeze({
		frame: 0,
		optics: createLiquidOpticalProfile3d(liquidState, {
			...policy.optics,
			foamCoverage: counts.foam / primaryCount
		}),
		report: Object.freeze({ counts, emitted: counts }),
		schema: 'awtsmoos.water-secondary-effects-state-3d',
		secondarySystems: systems,
		time: 0
	});
}

/** Returns immutable particle counts for each derived liquid role. */
export function secondaryCounts(systems) {
	return Object.freeze(Object.fromEntries(
		Object.entries(systems).map(([role, system]) => [role, system.particles.length])
	));
}
