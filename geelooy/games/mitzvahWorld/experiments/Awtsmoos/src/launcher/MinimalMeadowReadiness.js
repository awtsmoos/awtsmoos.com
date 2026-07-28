// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Holds the loading veil until renderer and gameplay features truly settle.
 * The Awtsmoos does not call a world complete while its garments remain unborn;
 * Awtsmoos.com reveals play only after rich light, combat, houses, sky, equipment, and UI answer.
 */

import {
	publishRendererRuntimeEvidence
} from '../app/RendererRuntimeEvidence.js';
import {
	markRendererHydration
} from '../app/RuntimeStateMarker.js';
import {
	awaitMinimalMeadowPaint,
	settleMinimalMeadowFeatures
} from './MinimalMeadowReadinessSettlement.js';

export async function awaitMinimalMeadowReadiness(
	diagnostics,
	loading,
	documentValue,
	environment = globalThis
) {
	const runtime = diagnostics.runtime;
	const root = documentValue.documentElement;
	renderCoreFrame(runtime);
	root.dataset.awtsmoosReadiness = 'settling';
	loading.world({
		message: 'Building the living meadow, combat, houses, sky, and equipment…',
		progress: 0.92
	});
	diagnostics.rendererPromise = hydrateRenderer(
		runtime,
		documentValue,
		environment
	);
	const [renderer, features] = await Promise.all([
		diagnostics.rendererPromise,
		settleMinimalMeadowFeatures(diagnostics, documentValue)
	]);
	renderCoreFrame(runtime);
	await awaitMinimalMeadowPaint(environment);
	const degraded = !features.ready || Boolean(runtime.rendererHydrationError);
	root.dataset.awtsmoosReadiness = degraded ? 'degraded-ready' : 'ready';
	loading.world({
		message: degraded
			? 'The meadow is ready with a safe fallback for one optional system.'
			: 'The meadow is ready. Every visible system has settled.',
		progress: 1
	});
	diagnostics.readinessReceipt = Object.freeze({
		degraded,
		features,
		paintedFrames: 2,
		renderer: Boolean(renderer),
		state: root.dataset.awtsmoosReadiness
	});
	return diagnostics;
}

function hydrateRenderer(runtime, documentValue, environment) {
	const root = documentValue.documentElement;
	if (typeof runtime.renderer.hydrate !== 'function') {
		root.dataset.awtsmoosRendererStage = 'fallback-ready';
		publishRendererRuntimeEvidence(runtime.renderer, root);
		markRendererHydration(
			runtime.renderer.hydrationState || 'fallback-ready',
			documentValue
		);
		return Promise.resolve(null);
	}
	root.dataset.awtsmoosRendererStage = 'hydrating';
	markRendererHydration('loading', documentValue);
	return runtime.renderer.hydrate({ environment })
		.then(delegate => {
			root.dataset.awtsmoosRendererStage = delegate
				? 'rich-ready'
				: 'bootstrap-ready';
			publishRendererRuntimeEvidence(runtime.renderer, root);
			markRendererHydration(
				runtime.renderer.hydrationState || 'ready',
				documentValue
			);
			return delegate;
		})
		.catch(error => {
			runtime.rendererHydrationError = error?.message || String(error);
			root.dataset.awtsmoosRendererStage = 'bootstrap-degraded';
			publishRendererRuntimeEvidence(runtime.renderer, root);
			markRendererHydration('degraded', documentValue);
			environment.console?.warn?.(
				'[MitzvahWorld] rich renderer unavailable; safe bootstrap retained.',
				error
			);
			return null;
		});
}

function renderCoreFrame(runtime) {
	runtime.cameraRig.update(runtime.camera, runtime.state, runtime.mainOctree, 1);
	runtime.renderer.setInteractor?.(runtime.state);
	runtime.renderer.render(runtime.scene, runtime.camera);
	runtime.ui?.refresh?.();
	runtime.bootstrapHud?.refresh?.();
}

export default awaitMinimalMeadowReadiness;
