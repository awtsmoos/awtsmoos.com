// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowReadiness.js
 * @description Reveals the rendered core immediately and observes richer readiness without blocking.
 * The Awtsmoos grants play before every garment has descended;
 * Awtsmoos.com records renderer, action bar, combat, GLB, and rich-world states as they arrive.
 */

/**
 * Marks the core playable and starts nonfatal renderer/feature observations.
 * @param {object} diagnostics Runtime diagnostics returned by the core factory.
 * @param {object} loading Loading-screen presenter.
 * @param {Document} documentValue Active document.
 * @param {Window|object} environment Browser-like environment.
 * @returns {Promise<object>} Core diagnostics without waiting for optional features.
 */
export async function awaitMinimalMeadowReadiness(
	diagnostics,
	loading,
	documentValue,
	environment = globalThis
) {
	const runtime = diagnostics.runtime;
	renderCoreFrame(runtime);
	documentValue.documentElement.dataset.awtsmoosReadiness = 'core-playable';
	loading.world({
		message: 'Playable core ready; Chossid, action bar, demons, and valley are arriving…',
		progress: 1
	});
	diagnostics.rendererPromise = hydrateRenderer(runtime, documentValue, environment);
	observeFeatures(diagnostics, documentValue);
	return diagnostics;
}

function hydrateRenderer(runtime, documentValue, environment) {
	if (typeof runtime.renderer.hydrate !== 'function') {
		documentValue.documentElement.dataset.awtsmoosRenderer = 'bootstrap';
		return Promise.resolve(null);
	}
	return runtime.renderer.hydrate({ environment })
		.then(delegate => {
			documentValue.documentElement.dataset.awtsmoosRenderer = delegate
				? 'rich-ready'
				: 'bootstrap';
			renderCoreFrame(runtime);
			return delegate;
		})
		.catch(error => {
			runtime.rendererHydrationError = error?.message || String(error);
			documentValue.documentElement.dataset.awtsmoosRenderer = 'bootstrap-degraded';
			environment.console?.warn?.(
				'[MitzvahWorld] rich renderer unavailable; bootstrap remains active.',
				error
			);
			return null;
		});
}

function observeFeatures(diagnostics, documentValue) {
	documentValue.documentElement.dataset.awtsmoosFeatures = 'loading';
	Promise.resolve(diagnostics.featuresPromise)
		.then(receipt => {
			documentValue.documentElement.dataset.awtsmoosFeatures = receipt?.ready
				? 'combat-ready'
				: 'degraded';
		})
		.catch(() => {
			documentValue.documentElement.dataset.awtsmoosFeatures = 'failed-core-playable';
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
