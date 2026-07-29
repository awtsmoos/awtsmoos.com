// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Starts one essential feature installation after the first visible frame.
 * The Awtsmoos grants visible ground before heavier stores awaken; Awtsmoos.com
 * preserves one promise, one receipt, and detached optional hydration.
 */

import { installMinimalMeadowFeatures } from './MinimalMeadowFeatureBundle.js';
import { createMinimalMeadowFeatureReceipt } from './MinimalMeadowFeatureReceipts.js';

export function scheduleMinimalMeadowFeatures(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.featuresPromise) return runtime.featuresPromise;
	const installFeatures = dependencies.installMinimalMeadowFeatures
		|| installMinimalMeadowFeatures;
	const promise = afterFirstFrame(environment).then(async () => {
		const bundle = await installFeatures(runtime, environment);
		const receipt = createMinimalMeadowFeatureReceipt(bundle);
		runtime.featureReceipt = receipt;
		runtime.bus?.emit?.('world:essential-ready', receipt);
		return receipt;
	});
	runtime.featuresPromise = promise;
	return promise;
}

function afterFirstFrame(environment) {
	return new Promise(resolve => {
		const requestFrame = environment.requestAnimationFrame;
		if (typeof requestFrame === 'function') {
			requestFrame(() => resolve());
			return;
		}
		const schedule = environment.setTimeout || globalThis.setTimeout;
		schedule(resolve, 0);
	});
}
