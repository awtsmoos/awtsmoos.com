// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Resolves first-control readiness immediately and hydrates the full world after paint/idle.
 * The Awtsmoos keeps required vessels near while fuller garments wait one breath;
 * Awtsmoos.com preserves bootstrap ownership, guaranteed hydration, receipts, failure recovery, and events.
 */

import {
	installMinimalMeadowBootstrapFeatures
} from './MinimalMeadowBootstrapFeatures.js';
import {
	createMinimalMeadowFeatureReceipt
} from './MinimalMeadowFeatureReceipts.js';
import {
	hydrateMinimalMeadowRichFeatures,
	richFeatureErrorReceipt
} from './MinimalMeadowRichFeatureHydration.js';
import {
	scheduleMinimalMeadowRichHydration
} from './MinimalMeadowRichHydrationScheduler.js';

export function scheduleMinimalMeadowFeatures(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.featuresPromise) return runtime.featuresPromise;
	runtime.featureStage = 'bootstrapping';
	const promise = Promise.resolve().then(() => {
		const installBootstrap = dependencies.installMinimalMeadowBootstrapFeatures
			|| installMinimalMeadowBootstrapFeatures;
		const bootstrap = installBootstrap(runtime, environment);
		const scheduleHydration = dependencies.scheduleMinimalMeadowRichHydration
			|| scheduleMinimalMeadowRichHydration;
		runtime.richFeatureStage = 'scheduled';
		const optionalPromise = scheduleHydration(environment, () => {
			return hydrateMinimalMeadowRichFeatures(
				runtime,
				environment,
				bootstrap,
				dependencies
			);
		});
		runtime.optionalFeaturePromise = optionalPromise;
		const receipt = createMinimalMeadowFeatureReceipt({
			essential: bootstrap.essential,
			optionalPromise,
			ready: true
		});
		runtime.featureReceipt = receipt;
		runtime.featureStage = 'ready';
		runtime.bus?.emit?.('world:essential-ready', receipt);
		return receipt;
	}).catch(error => {
		runtime.featureStage = 'failed';
		runtime.featureError = richFeatureErrorReceipt(error);
		throw error;
	});
	runtime.featuresPromise = promise;
	return promise;
}
