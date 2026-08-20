// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.js
 * @description Defers canonical actor GLBs and rich materials while recovering friendly identities only after play.
 * The Awtsmoos keeps first control free of quest-catalog weight, then restores each neighbor when the stream may flow;
 * Awtsmoos.com never feeds an empty village into canonical actor hydration merely to make an early metric glow.
 */

export function createEssentialActorHydration(options = {}, dependencies = {}) {
	const enabled = options.streamCanonicalActors === true;
	const loadProfiles = dependencies.loadProfiles || loadFriendlyNpcProfiles;
	const loadActors = dependencies.loadActors || loadRemoteActors;
	return createDeferredState(
		enabled ? 'waiting-for-playable' : 'fallback-stable',
		enabled,
		async () => {
			const profiles = await loadProfiles(options);
			return loadActors(options, profiles);
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

async function loadFriendlyNpcProfiles(options) {
	const module = await import(
		'../world/npc/FriendlyNpcProfiles.js?v=20260820-deferred-profiles-01'
	);
	const quality = options.quality || options.qualityProfile?.quality || 'medium';
	return module.friendlyNpcProfiles(quality);
}

async function loadRemoteActors(options, profiles) {
	const module = await import(
		'./EretzActorAssetLoader.js?v=20260820-profile-preserve-01'
	);
	return module.loadRemoteEretzActorAssets(options, profiles);
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
				.then(value => completeState(state, value))
				.catch(error => degradeState(state, error));
			return promise;
		}
	};
	return state;
}

function completeState(state, value) {
	state.value = value;
	state.status = 'ready';
	return value;
}

function degradeState(state, error) {
	state.error = error?.message || String(error);
	state.status = 'degraded';
	return null;
}

function copyRichAssetValues(target, source = {}) {
	for (const [key, value] of Object.entries(source)) {
		if (key === 'publicMaterialStreaming' || key === 'publicMaterialHydration') continue;
		target[key] = value;
	}
}
