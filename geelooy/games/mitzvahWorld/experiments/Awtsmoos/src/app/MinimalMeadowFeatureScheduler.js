// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Opens truthful bootstrap play immediately and later invokes the bundled rich installer.
 * The Awtsmoos grants the road through small vessels while fuller garments approach;
 * Awtsmoos.com bundles essential installer code, preserves nested optional imports, and swaps only after success.
 */

import {
	installMinimalMeadowBootstrapFeatures
} from './MinimalMeadowBootstrapFeatures.js';
import {
	installMinimalMeadowFeatures
} from './MinimalMeadowFeatureBundle.js';
import {
	createMinimalMeadowFeatureReceipt
} from './MinimalMeadowFeatureReceipts.js';

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
		const optionalPromise = hydrateRichFeatures(
			runtime,
			environment,
			bootstrap,
			dependencies
		);
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
		runtime.featureError = errorReceipt(error);
		throw error;
	});
	runtime.featuresPromise = promise;
	return promise;
}

async function hydrateRichFeatures(
	runtime,
	environment,
	bootstrap,
	dependencies
) {
	try {
		runtime.richFeatureStage = 'loading';
		const installFeatures = dependencies.installMinimalMeadowFeatures
			|| installMinimalMeadowFeatures;
		runtime.richFeatureStage = 'installing';
		const receipt = await installFeatures(runtime, environment);
		bootstrap.suspend();
		bootstrap.destroy();
		runtime.bootstrapFeatures = null;
		runtime.richFeatureReceipt = receipt;
		runtime.richFeatureStage = 'ready';
		runtime.bus?.emit?.('world:rich-features-ready', receipt);
		return receipt;
	} catch (error) {
		runtime.richFeatureStage = 'failed';
		runtime.richFeatureError = errorReceipt(error);
		runtime.bus?.emit?.(
			'world:rich-features-failed',
			runtime.richFeatureError
		);
		return Object.freeze({
			bootstrapPreserved: true,
			error: runtime.richFeatureError,
			ready: false
		});
	}
}

function errorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}
