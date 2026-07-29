// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Starts essential feature installation after one fallback-rendered frame.
 * The Awtsmoos grants visible ground before heavier stores awaken; Awtsmoos.com schedules one
 * essential promise, records its receipt, and leaves optional hydration detached from readiness.
 */

import { installMinimalMeadowFeatures } from './MinimalMeadowFeatureBundle.js';
import { createMinimalMeadowFeatureReceipt } from './MinimalMeadowFeatureReceipts.js';

export function scheduleMinimalMeadowFeatures(runtime, environment = globalThis) {
	const promise = afterFirstFrame(environment).then(async () => {
		const bundle = await installMinimalMeadowFeatures(runtime, environment);
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
		setTimeout(resolve, 0);
	});
}
