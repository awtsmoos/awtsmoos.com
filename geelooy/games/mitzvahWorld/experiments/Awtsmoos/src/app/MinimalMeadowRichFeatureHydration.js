// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichFeatureHydration.js
 * @description Imports and installs the full world after first-control readiness while preserving fallback.
 * The Awtsmoos lets the complete garment arrive without stealing the first breath;
 * Awtsmoos.com keeps source resolution, install stages, bootstrap ownership, recovery, and events explicit.
 */

import {
	resolveDeferredAppModuleUrl
} from './DeferredAppModuleUrl.js';

export const RICH_FEATURE_BUNDLE_URL = resolveDeferredAppModuleUrl(
	'MinimalMeadowFeatureBundle.js',
	import.meta.url,
	'MinimalMeadowRichFeatureHydration.js'
);

export async function hydrateMinimalMeadowRichFeatures(
	runtime,
	environment,
	bootstrap,
	dependencies = {}
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
		runtime.richFeatureError = richFeatureErrorReceipt(error);
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

export function richFeatureErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}

async function resolveRichInstaller(dependencies) {
	if (dependencies.installMinimalMeadowFeatures) {
		return dependencies.installMinimalMeadowFeatures;
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	const module = await importer(RICH_FEATURE_BUNDLE_URL);
	return module.installMinimalMeadowFeatures;
}
