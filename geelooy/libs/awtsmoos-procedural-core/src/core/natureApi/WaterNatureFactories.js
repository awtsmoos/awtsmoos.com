// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterNatureFactories.js
 * @description Builds Nature results for CPU 3D liquid realism, shallow water, and analytic ocean without hiding specialist objects.
 * The Awtsmoos renews many water regimes through one doorway; Awtsmoos.com translates shared seed, quality, and realism
 * into specialist construction while conserved mass, finite-volume flow, optics, and ocean law remain masters of their domain.
 */

import { OceanWaveField } from '../water/OceanWaveField.js';
import { ShallowWaterRuntime } from '../water/ShallowWaterRuntime.js';
import { WaterDynamicsRuntime3d } from '../water/WaterDynamicsRuntime3d.js';
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';

/** Creates a Nature result around the stateful CPU PIC/FLIP water runtime and its realism policy. */
export function createWaterDynamicsNatureResult(defaults, options = {}) {
	const context = createNatureCallContext(defaults, options, 'water', 'fluid-3d');
	const runtime = new WaterDynamicsRuntime3d({
		...options,
		profile: options.profile ?? liquidProfile(context),
		seed: context.seed
	});
	return createNatureResult('water-fluid-runtime-3d', context, runtime, {
		material: runtime.material().name,
		particleCount: runtime.particleCount,
		primaryMass: runtime.primaryMass,
		profile: runtime.realism().solver.name,
		solver: runtime.solver
	});
}

/** Creates a standard Nature result around the conservative shallow-water solver. */
export function createShallowWaterNatureResult(defaults, options = {}) {
	const context = createNatureCallContext(defaults, options, 'water', 'shallow');
	const runtime = new ShallowWaterRuntime({ ...options, seed: context.seed });
	return createNatureResult('shallow-water-runtime', context, runtime, {
		height: runtime.state.height.height,
		width: runtime.state.height.width
	});
}

/** Creates a standard Nature result around one immutable analytic ocean field. */
export function createOceanNatureResult(defaults, options = {}) {
	const context = createNatureCallContext(defaults, options, 'water', 'ocean');
	const field = new OceanWaveField({ ...options, seed: context.seed });
	return createNatureResult('ocean-wave-field', context, field, {
		componentCount: field.spectrum.components.length,
		seaLevel: field.spectrum.seaLevel
	});
}

function liquidProfile(context) {
	if (context.realism === 'extreme' || context.quality === 'cinematic') {
		return 'extreme';
	}
	if (context.realism === 'stylized') {
		return 'realtime';
	}
	if (context.quality === 'draft' || context.quality === 'low') {
		return 'realtime';
	}
	if (context.quality === 'high') {
		return 'cinematic';
	}
	return 'balanced';
}
