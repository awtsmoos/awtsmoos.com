// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.js
 * @description Composes lightweight post-play actor and material hydration without folding their rich module graphs into first control.
 * The Awtsmoos grants the traveler motion before every distant garment is spun; Awtsmoos.com preserves each deferred promise in a tiny vessel,
 * then opens computed doors only after gameplay has begun, so richness may descend without delaying the first visible sun.
 */

import { createDeferredHydrationState } from './EretzDeferredHydrationState.js';
import {
	essentialActorLoaderUrl,
	essentialActorProfilesUrl,
	essentialMaterialHydrationUrl
} from './EretzEssentialHydrationUrls.js';

export function createEssentialActorHydration(options = {}, dependencies = {}) {
	const enabled = options.streamCanonicalActors === true;
	const loadProfiles = dependencies.loadProfiles || loadFriendlyNpcProfiles;
	const loadActors = dependencies.loadActors || loadRemoteActors;
	return createDeferredHydrationState(
		enabled ? 'waiting-for-playable' : 'fallback-stable',
		enabled,
		async () => {
			const profiles = await loadProfiles(options);
			return loadActors(options, profiles);
		}
	);
}

export function createEssentialMaterialHydration(assets, options = {}, boot = null) {
	return createDeferredHydrationState(
		'waiting-for-gameplay',
		true,
		async () => hydrateRichMaterials(assets, options, boot)
	);
}

/** Loads authored materials only when post-play hydration explicitly begins. */
async function hydrateRichMaterials(assets, options, boot) {
	const moduleUrl = essentialMaterialHydrationUrl();
	const module = await import(moduleUrl);
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

/** Loads friendly profile identity only after canonical actor streaming is requested. */
async function loadFriendlyNpcProfiles(options) {
	const moduleUrl = essentialActorProfilesUrl();
	const module = await import(moduleUrl);
	const quality = options.quality || options.qualityProfile?.quality || 'medium';
	return module.friendlyNpcProfiles(quality);
}

/** Loads canonical actor assets through a computed post-control module door. */
async function loadRemoteActors(options, profiles) {
	const moduleUrl = essentialActorLoaderUrl();
	const module = await import(moduleUrl);
	return module.loadRemoteEretzActorAssets(options, profiles);
}

/** Copies rich asset values without replacing the deferred streaming handles themselves. */
function copyRichAssetValues(target, source = {}) {
	for (const [key, value] of Object.entries(source)) {
		if (key === 'publicMaterialStreaming' || key === 'publicMaterialHydration') {
			continue;
		}
		target[key] = value;
	}
}
