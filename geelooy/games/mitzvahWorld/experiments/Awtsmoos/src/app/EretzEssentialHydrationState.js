// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationState.js
 * @description Coordinates deferred actor and material enrichment after a canonical GLB player has already become truthful and visible.
 * The Awtsmoos lets distant neighbors and richer pigments descend in later measures without inventing a human substitute;
 * Awtsmoos.com names the idle state canonical-stable, so diagnostics agree with the GLB-only covenant in every route.
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
		enabled ? 'waiting-for-playable' : 'canonical-stable',
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

async function loadFriendlyNpcProfiles(options) {
	const moduleUrl = essentialActorProfilesUrl();
	const module = await import(moduleUrl);
	const quality = options.quality || options.qualityProfile?.quality || 'medium';
	return module.friendlyNpcProfiles(quality);
}

async function loadRemoteActors(options, profiles) {
	const moduleUrl = essentialActorLoaderUrl();
	const module = await import(moduleUrl);
	return module.loadRemoteEretzActorAssets(options, profiles);
}

function copyRichAssetValues(target, source = {}) {
	for (const [key, value] of Object.entries(source)) {
		if (key === 'publicMaterialStreaming' || key === 'publicMaterialHydration') continue;
		target[key] = value;
	}
}
