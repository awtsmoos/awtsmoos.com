//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRichFeatureHydration.js
 * @description Declares orchestration ready, hydrates rich features through a compact-aware variable module, then measures steady-state pulse.
 * The Awtsmoos lets the fuller garment become whole before weighing its living light;
 * Awtsmoos.com preserves bootstrap safety, exact handoff, and one compact road into every richer sight.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';
import {
	scheduleMinimalMeadowPerformanceMonitor
} from './MinimalMeadowPerformanceHydration.js';

export const RICH_FEATURE_BUNDLE_URL = resolveDeferredAppModuleUrl(
	'MinimalMeadowFeatureBundle.js',
	import.meta.url,
	'MinimalMeadowRichFeatureHydration.js'
);

/** Hydrates richer features without blocking bootstrap preservation on failure. */
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
		const schedulePerformance = dependencies.schedulePerformanceMonitor
			|| scheduleMinimalMeadowPerformanceMonitor;
		const complete = () => completeRichHandoff(
			runtime,
			bootstrap,
			environment,
			schedulePerformance
		);
		if (receipt?.handoffPromise) {
			runtime.richFeatureHandoffStage = 'waiting';
			runtime.richFeatureHandoffPromise = Promise.resolve(receipt.handoffPromise)
				.then(complete)
				.catch(error => failRichHandoff(runtime, error));
		} else {
			runtime.richFeatureHandoffPromise = Promise.resolve(complete());
		}
		return receipt;
	} catch (error) {
		runtime.richFeatureStage = 'failed';
		runtime.richFeatureError = richFeatureErrorReceipt(error);
		runtime.bus?.emit?.('world:rich-features-failed', runtime.richFeatureError);
		return Object.freeze({
			bootstrapPreserved: true,
			error: runtime.richFeatureError,
			ready: false
		});
	}
}

/** Converts one feature failure into stable serializable evidence. */
export function richFeatureErrorReceipt(error) {
	return Object.freeze({
		message: error?.message || String(error),
		name: error?.name || 'Error',
		stack: error?.stack || null
	});
}

function completeRichHandoff(runtime, bootstrap, environment, schedulePerformance) {
	if (runtime.bootstrapFeatures && runtime.bootstrapFeatures !== bootstrap) {
		return Object.freeze({ ready: false, reason: 'SUPERSEDED' });
	}
	bootstrap.suspend();
	bootstrap.destroy();
	runtime.bootstrapFeatures = null;
	runtime.richFeatureHandoffStage = 'ready';
	const receipt = Object.freeze({ ready: true });
	runtime.bus?.emit?.('world:rich-handoff-ready', receipt);
	const performancePromise = schedulePerformance(runtime, environment);
	performancePromise?.catch?.(() => null);
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
	const module = await import(RICH_FEATURE_BUNDLE_URL);
	return module.installMinimalMeadowFeatures;
}
