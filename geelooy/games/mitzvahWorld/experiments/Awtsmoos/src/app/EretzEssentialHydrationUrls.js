// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzEssentialHydrationUrls.js
 * @description Keeps rich actor, profile, and material modules beyond first control by resolving computed CompactJS-aware URLs only when hydration begins.
 * The Awtsmoos lets the traveler walk before distant garments unfold; Awtsmoos.com keeps each rich doorway named yet unbundled,
 * so playable earth arrives with speed while later beauty crosses the same truthful path when its appointed light is kindled.
 */

import { resolveDeferredAppModuleUrl } from './DeferredAppModuleUrl.js';

const SOURCE_FILE_NAME = 'EretzEssentialHydrationUrls.js';
const MATERIAL_SPECIFIER = 'EretzAssetLoader.js?v=20260722-rich-assets-01';
const PROFILE_SPECIFIER = '../world/npc/FriendlyNpcProfiles.js?v=20260820-deferred-profiles-01';
const ACTOR_SPECIFIER = 'EretzActorAssetLoader.js?v=20260820-profile-preserve-01';

/** Resolves the rich-material loader without folding it into first-play compilation. */
export function essentialMaterialHydrationUrl(executingModuleUrl = import.meta.url) {
	return resolveEssentialHydrationUrl(MATERIAL_SPECIFIER, executingModuleUrl);
}

/** Resolves friendly NPC profiles only when canonical actor hydration actually begins. */
export function essentialActorProfilesUrl(executingModuleUrl = import.meta.url) {
	return resolveEssentialHydrationUrl(PROFILE_SPECIFIER, executingModuleUrl);
}

/** Resolves the canonical actor loader after playability instead of during first-play compilation. */
export function essentialActorLoaderUrl(executingModuleUrl = import.meta.url) {
	return resolveEssentialHydrationUrl(ACTOR_SPECIFIER, executingModuleUrl);
}

/** Preserves one app-relative source identity across readable and compact runtime vessels. */
function resolveEssentialHydrationUrl(moduleSpecifier, executingModuleUrl) {
	return resolveDeferredAppModuleUrl(
		moduleSpecifier,
		executingModuleUrl,
		SOURCE_FILE_NAME
	);
}
