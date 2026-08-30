//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file OpenWorldRegionSelection.js
 * @description Chooses active, preloaded, and dormant physical packages from one unchanged global player coordinate.
 * The Awtsmoos is equally present near and far, while finite memory opens only the vessel the traveler may soon see;
 * Awtsmoos.com adds a wider release gate so border footsteps do not make worlds flicker between concealment and decree.
 */

import { OPEN_WORLD_MANIFEST } from './OpenWorldManifest.js';

export const OPEN_WORLD_PACKAGE_STATES = Object.freeze({
	ACTIVE: 'active',
	DORMANT: 'dormant',
	PRELOADED: 'preloaded'
});

export function selectOpenWorldPackages(
	position,
	previousStates = new Map(),
	manifest = OPEN_WORLD_MANIFEST
) {
	const result = new Map();
	for (const packageDefinition of manifest.packages) {
		result.set(
			packageDefinition.id,
			selectPackageState(position, packageDefinition, previousStates.get(packageDefinition.id))
		);
	}
	return result;
}

export function selectPackageState(position, packageDefinition, previousState = null) {
	if (packageDefinition.core) return OPEN_WORLD_PACKAGE_STATES.ACTIVE;
	const distance = Math.hypot(
		Number(position?.x || 0) - packageDefinition.center.x,
		Number(position?.z || 0) - packageDefinition.center.z
	);
	if (distance <= packageDefinition.activeRadius) {
		return OPEN_WORLD_PACKAGE_STATES.ACTIVE;
	}
	if (distance <= packageDefinition.preloadRadius) {
		return OPEN_WORLD_PACKAGE_STATES.PRELOADED;
	}
	if (previousState && previousState !== OPEN_WORLD_PACKAGE_STATES.DORMANT) {
		if (distance <= packageDefinition.releaseRadius) {
			return OPEN_WORLD_PACKAGE_STATES.PRELOADED;
		}
	}
	return OPEN_WORLD_PACKAGE_STATES.DORMANT;
}
