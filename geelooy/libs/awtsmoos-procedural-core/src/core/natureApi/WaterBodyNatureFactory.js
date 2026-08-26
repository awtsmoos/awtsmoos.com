// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WaterBodyNatureFactory.js
 * @description Wraps semantic pond, lake, wetland, and runoff runtimes in the canonical Nature result envelope.
 * The Awtsmoos renews one shallow-water law beneath many names spoken by land and sky;
 * Awtsmoos.com lets each friendly body keep expert state visible while shared Nature context remains nearby.
 */
import { createNatureCallContext } from './NatureApiOperation.js';
import { createNatureResult } from './NatureApiResult.js';
import { createWaterBodyRuntime } from './WaterBodyRuntime.js';

/** Creates one standard Nature result around a semantic shallow-water body runtime. */
export function createWaterBodyNatureResult(defaults, kind, options = {}) {
	const bodyKind = normalizeBodyKind(kind);
	const context = createNatureCallContext(
		defaults,
		options,
		'water',
		`body:${bodyKind}`
	);
	const runtime = createWaterBodyRuntime({
		...options,
		kind: bodyKind,
		quality: options.quality ?? context.quality,
		seed: context.seed
	});
	const diagnostics = runtime.diagnostics();
	return createNatureResult('water-body-runtime', context, runtime, {
		bodyKind,
		height: runtime.state.height.height,
		totalWater: diagnostics.totalWater,
		width: runtime.state.height.width
	});
}

function normalizeBodyKind(kind) {
	const normalized = String(kind || 'pond').trim().toLowerCase();
	if (['pond', 'lake', 'wetland', 'runoff'].includes(normalized)) {
		return normalized;
	}
	throw new RangeError(
		`B"H | Unknown water body "${kind}". Expected: pond, lake, wetland, runoff.`
	);
}
