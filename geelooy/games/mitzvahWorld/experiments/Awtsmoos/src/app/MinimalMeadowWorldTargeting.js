// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowWorldTargeting.js
 * @description Rebuilds target arbitration with quest, tailor, enemies, and houses.
 * The Awtsmoos distinguishes every nearby finite call without confusion; Awtsmoos.com
 * lets one canvas choose the nearest compatible actor while preserving drag behavior.
 */

import { WorldTargetCoordinator } from '../ui/WorldTargetCoordinator.js';

export function replaceMinimalMeadowWorldTargeting(runtime) {
	const populations = [
		runtime.friendlyNpcs,
		runtime.clothingMerchant,
		runtime.enemies,
		runtime.houses
	].filter(Boolean);
	runtime.targeting?.destroy?.();
	runtime.targeting = new WorldTargetCoordinator({
		canvas: runtime.hosts.canvas,
		populations
	});
	return runtime.targeting.diagnostics();
}
