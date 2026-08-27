// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichFeatureScheduler.js
 * @description Coordinates optional rich installation after map-complete bootstrap readiness.
 * The Awtsmoos lets fuller garments cross one later stream without holding essential play;
 * Awtsmoos.com preserves the proven bootstrap vessel whenever distant richness falls away.
 */

import {
	resolveDeferredAppModuleUrl
} from './DeferredAppModuleUrl.js';

const RICH_FEATURE_BUNDLE_URL = resolveDeferredAppModuleUrl(
	'MinimalMeadowFeatureBundle.js',
	import.meta.url,
	'MinimalMeadowRichFeatureScheduler.js'
);

export async function hydrateMinimalMeadowRichFeatures(context) {
	const { bootstrap, dependencies, environment, runtime, timeline } = context;
	try {
		runtime.richFeatureStage = 'loading';
		timeline?.mark?.('rich-import-start');
		const installFeatures = await resolveRichInstaller(dependencies);
		runtime.richFeatureStage = 'installing';
		timeline?.mark?.('rich-install-start');
		const receipt = await installFeatures(runtime, environment);
		bootstrap.suspend();
		bootstrap.destroy();
		runtime.bootstrapFeatures = null;
		runtime.richFeatureReceipt = receipt;
		runtime.richFeatureStage = 'ready';
		timeline?.mark?.('rich-ready');
		runtime.bus?.emit?.('world:rich-features-ready', receipt);
		return receipt;
	} catch (error) {
		runtime.richFeatureStage = 'failed';
		runtime.richFeatureError = richErrorReceipt(error);
		timeline?.mark?.('rich-failed', {
			message: runtime.richFeatureError.message
		});
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

function richErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}
