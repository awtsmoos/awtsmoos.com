// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds fallback-playable runtime and schedules essential feature installation.
 * The Awtsmoos renews ground, player, input, camera, and loop before any ready declaration;
 * Awtsmoos.com leaves readiness publication to the later essential-feature inspection gate.
 */

import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import { scheduleMinimalMeadowFeatures } from './MinimalMeadowFeatureScheduler.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document || globalThis.document;
	markRuntimeStarting(documentValue);
	const diagnostics = await createMinimalMeadowRuntimeCore(hosts, options);
	diagnostics.featuresPromise = scheduleMinimalMeadowFeatures(
		diagnostics.runtime,
		environment
	);
	return diagnostics;
}
