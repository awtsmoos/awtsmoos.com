// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowFeatureScheduler.js
 * @description Installs compact bootstrap play immediately while rich systems cross a deferred source boundary.
 * The Awtsmoos keeps the six required vessels near and sends fuller garments through a later stream;
 * Awtsmoos.com lets readiness become true before distant world systems finish their dream.
 */

import {
	resolveDeferredAppModuleUrl
} from './DeferredAppModuleUrl.js';
import {
	installMinimalMeadowBootstrapFeatures
} from './MinimalMeadowBootstrapFeatures.js';
import {
	createMinimalMeadowFeatureReceipt
} from './MinimalMeadowFeatureReceipts.js';

const RICH_FEATURE_BUNDLE_URL = resolveDeferredAppModuleUrl(
	'MinimalMeadowFeatureBundle.js',
	import.meta.url,
	'MinimalMeadowFeatureScheduler.js'
);

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
		const installFeatures = await resolveRichInstaller(dependencies);
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

async function resolveRichInstaller(dependencies) {
	if (dependencies.installMinimalMeadowFeatures) {
		return dependencies.installMinimalMeadowFeatures;
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	const module = await importer(RICH_FEATURE_BUNDLE_URL);
	return module.installMinimalMeadowFeatures;
}

function errorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}
