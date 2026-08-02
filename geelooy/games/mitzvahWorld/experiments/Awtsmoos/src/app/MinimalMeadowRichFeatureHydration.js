// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichFeatureHydration.js
 * @description Declares rich presentation ready before atomically replacing bootstrap world authority.
 * The Awtsmoos lets the fuller garment appear without removing the first playable ground;
 * Awtsmoos.com keeps ready, handoff, bootstrap ownership, failure recovery, and receipts explicit.
 */

import {
	resolveDeferredAppModuleUrl
} from './DeferredAppModuleUrl.js';

const RICH_FEATURE_BUNDLE_URL = resolveDeferredAppModuleUrl(
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
		runtime.richFeatureReceipt = receipt;
		runtime.richFeatureStage = 'ready';
		runtime.bus?.emit?.('world:rich-features-ready', receipt);
		if (receipt?.handoffPromise) {
			runtime.richFeatureHandoffStage = 'waiting';
			runtime.richFeatureHandoffPromise = Promise.resolve(
				receipt.handoffPromise
			)
				.then(() => completeRichHandoff(runtime, bootstrap))
				.catch(error => failRichHandoff(runtime, error));
		} else {
			const handoff = completeRichHandoff(runtime, bootstrap);
			runtime.richFeatureHandoffPromise = Promise.resolve(handoff);
		}
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

function completeRichHandoff(runtime, bootstrap) {
	if (runtime.bootstrapFeatures && runtime.bootstrapFeatures !== bootstrap) {
		return Object.freeze({ ready: false, reason: 'SUPERSEDED' });
	}
	bootstrap.suspend();
	bootstrap.destroy();
	runtime.bootstrapFeatures = null;
	runtime.richFeatureHandoffStage = 'ready';
	const receipt = Object.freeze({ ready: true });
	runtime.bus?.emit?.('world:rich-handoff-ready', receipt);
	return receipt;
}

function failRichHandoff(runtime, error) {
	runtime.richFeatureHandoffStage = 'failed';
	runtime.richFeatureHandoffError = richFeatureErrorReceipt(error);
	const receipt = Object.freeze({
		bootstrapPreserved: true,
		error: runtime.richFeatureHandoffError,
		ready: false
	});
	runtime.bus?.emit?.('world:rich-handoff-failed', receipt);
	return receipt;
}

async function resolveRichInstaller(dependencies) {
	if (dependencies.installMinimalMeadowFeatures) {
		return dependencies.installMinimalMeadowFeatures;
	}
	const importer = dependencies.importer || (specifier => import(specifier));
	const module = await importer(RICH_FEATURE_BUNDLE_URL);
	return module.installMinimalMeadowFeatures;
}
