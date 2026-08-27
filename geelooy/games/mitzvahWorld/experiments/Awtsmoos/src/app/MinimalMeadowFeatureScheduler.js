// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Installs folded mechanics, awaits the real map, then starts optional rich hydration.
 * The Awtsmoos keeps essential play and one truthful map near while later garments cross the stream.
 */

import {
	awaitMinimalMeadowBootstrapReadiness
} from './MinimalMeadowBootstrapReadiness.js';
import {
	installMinimalMeadowBootstrapFeatures
} from './MinimalMeadowBootstrapFeatures.js';
import {
	createMinimalMeadowFeatureReceipt
} from './MinimalMeadowFeatureReceipts.js';
import {
	hydrateMinimalMeadowRichFeatures
} from './MinimalMeadowRichFeatureScheduler.js';

export function scheduleMinimalMeadowFeatures(
	runtime,
	environment = globalThis,
	dependencies = {}
) {
	if (runtime.featuresPromise) return runtime.featuresPromise;
	const timeline = dependencies.timeline || runtime.bootTimeline || null;
	runtime.featureStage = 'bootstrapping';
	timeline?.mark?.('essential-bootstrap-start');
	const promise = Promise.resolve().then(async () => {
		const installBootstrap = dependencies.installMinimalMeadowBootstrapFeatures
			|| installMinimalMeadowBootstrapFeatures;
		const bootstrap = installBootstrap(runtime, environment);
		const essential = await awaitMinimalMeadowBootstrapReadiness(
			bootstrap,
			timeline
		);
		timeline?.mark?.('essential-bootstrap-installed', {
			minimap: essential.minimap,
			ready: essential.ready
		});
		const optionalPromise = hydrateMinimalMeadowRichFeatures({
			bootstrap,
			dependencies,
			environment,
			runtime,
			timeline
		});
		runtime.optionalFeaturePromise = optionalPromise;
		const receipt = createMinimalMeadowFeatureReceipt({
			essential,
			optionalPromise,
			ready: true
		});
		runtime.featureReceipt = receipt;
		runtime.featureStage = 'ready';
		timeline?.mark?.('essential-ready');
		runtime.bus?.emit?.('world:essential-ready', receipt);
		return receipt;
	}).catch(error => failEssential(runtime, timeline, error));
	runtime.featuresPromise = promise;
	return promise;
}

function failEssential(runtime, timeline, error) {
	runtime.featureStage = 'failed';
	runtime.featureError = Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
	timeline?.mark?.('essential-failed', {
		message: runtime.featureError.message
	});
	throw error;
}
