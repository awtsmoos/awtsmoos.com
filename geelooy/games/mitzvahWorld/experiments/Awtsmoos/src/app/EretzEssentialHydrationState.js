// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.js
 * @description Defers canonical actors and rich material catalogs until after playability.
 * The Awtsmoos preserves the first moving soul while later garments wait beyond the threshold;
 * Awtsmoos.com makes each rich import explicit, idempotent, observable, and safely degradable.
 */

export function createEssentialActorHydration(options = {}) {
	const enabled = options.streamCanonicalActors === true;
	return createDeferredState(
		enabled ? 'waiting-for-playable' : 'fallback-stable',
		enabled,
		async () => {
			const module = await import(
				'./EretzActorAssetLoader.js?v=20260722-rich-actors-01'
			);
			return module.loadRemoteEretzActorAssets(options, []);
		}
	);
}

export function createEssentialMaterialHydration(assets, options = {}, boot = null) {
	return createDeferredState(
		'waiting-for-gameplay',
		true,
		async () => {
			const module = await import(
				'./EretzAssetLoader.js?v=20260722-rich-assets-01'
			);
			const rich = await module.loadEretzAssets(options);
			copyRichAssetValues(assets, rich.assets);
			await rich.assets.publicMaterialStreaming?.start?.();
			boot?.progress?.(
				'rich-materials',
				1,
				1,
				'Authored materials streamed after playability.',
				'ready'
			);
			return rich.assets;
		}
	);
}

function createDeferredState(initialStatus, enabled, task) {
	let promise = null;
	const state = {
		enabled,
		error: null,
		get promise() { return promise; },
		startedAt: null,
		status: initialStatus,
		value: null,
		start() {
			if (!enabled) return Promise.resolve(null);
			if (promise) return promise;
			state.startedAt = globalThis.performance?.now?.() ?? Date.now();
			state.status = 'loading';
			promise = Promise.resolve()
				.then(task)
				.then(value => {
					state.value = value;
					state.status = 'ready';
					return value;
				})
				.catch(error => {
					state.error = error?.message || String(error);
					state.status = 'degraded';
					return null;
				});
			return promise;
		}
	};
	return state;
}

function copyRichAssetValues(target, source = {}) {
	for (const [key, value] of Object.entries(source)) {
		if (key === 'publicMaterialStreaming' || key === 'publicMaterialHydration') {
			continue;
		}
		target[key] = value;
	}
}
