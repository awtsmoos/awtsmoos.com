// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createMinimalMeadowRuntime.js
 * @description Builds visible fallback play before dynamically loading essential feature systems.
 * The Awtsmoos reveals ground and traveler before every distant garment; Awtsmoos.com returns
 * the runtime factory promptly, then imports combat, stores, quests, recovery, and cells later.
 */

import { createMinimalMeadowRuntimeCore } from './MinimalMeadowRuntimeCore.js';
import { markRuntimeStarting } from './RuntimeStateMarker.js';

export async function createMinimalMeadowRuntime(hosts, options = {}) {
	const environment = options.environment || globalThis;
	const documentValue = environment.document || globalThis.document;
	markRuntimeStarting(documentValue);
	const diagnostics = await createMinimalMeadowRuntimeCore(hosts, options);
	diagnostics.featuresPromise = scheduleEssentialFeatures(
		diagnostics.runtime,
		environment
	);
	return diagnostics;
}

async function scheduleEssentialFeatures(runtime, environment) {
	await firstVisibleFrame(environment);
	const module = await import('./MinimalMeadowFeatureScheduler.js');
	return module.scheduleMinimalMeadowFeatures(runtime, environment);
}

function firstVisibleFrame(environment) {
	return new Promise(resolve => {
		const requestFrame = environment.requestAnimationFrame;
		if (typeof requestFrame === 'function') {
			requestFrame(() => resolve());
			return;
		}
		setTimeout(resolve, 0);
	});
}
