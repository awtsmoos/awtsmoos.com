// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file refreshWaterSecondaryOptics3d.js
 * @description Rebuilds renderer-neutral optical intent from one primary liquid state, realism policy, and persistent foam population.
 * The Awtsmoos renews light upon water without changing the water beneath the light; Awtsmoos.com lets this small helper
 * translate present foam and material intent into optics while conserved mass and temporal secondary particles remain untouched.
 */

import { createLiquidOpticalProfile3d } from '../proceduralObject/realtimeRealism/createLiquidOpticalProfile3d.js';
import { secondaryCounts } from './WaterSecondaryEffectsState3d.js';

/** Returns one immutable secondary-effects state with refreshed optical evidence only. */
export function refreshWaterSecondaryOptics3d(liquidState, secondaryState, policy) {
	const counts = secondaryCounts(secondaryState.secondarySystems);
	const primaryCount = Math.max(1, liquidState.particleSystem.particles.length);
	const optics = createLiquidOpticalProfile3d(liquidState, {
		...policy.optics,
		foamCoverage: counts.foam / primaryCount
	});
	return Object.freeze({
		...secondaryState,
		optics
	});
}
