// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file EretzWorldActorHydration.js
 * @description Coordinates early friendly life and later secondary actor systems through independent promises.
 * The Awtsmoos reveals the neighbor before the distant challenge, each vessel receiving its measured hour;
 * Awtsmoos.com keeps friendly presence responsive while heavier doors, horses, enemies, lava, and shadows retain their power.
 */

import { startEretzFriendlyActorHydration } from './EretzFriendlyActorHydration.js';
import { startEretzSecondaryActorHydration } from './EretzSecondaryActorHydration.js';

export function startEretzWorldActorHydration(runtime, options = {}, boot = null) {
	if (runtime.worldActorHydrationPromise) {
		return runtime.worldActorHydrationPromise;
	}
	const startFriendly = options.startFriendlyActorHydration
		|| startEretzFriendlyActorHydration;
	const startSecondary = options.startSecondaryActorHydration
		|| startEretzSecondaryActorHydration;
	const friendlyPromise = Promise.resolve(startFriendly(runtime, options, boot));
	const secondaryPromise = friendlyPromise.then(() => (
		startSecondary(runtime, options, boot)
	));
	runtime.friendlyActorHydrationPromise = friendlyPromise;
	runtime.secondaryActorHydrationPromise = secondaryPromise;
	const worldPromise = Promise.allSettled([
		friendlyPromise,
		secondaryPromise
	]).then(results => finalizeWorldActors(runtime, results));
	runtime.worldActorHydrationPromise = worldPromise;
	return worldPromise;
}

function finalizeWorldActors(runtime, results) {
	const friendly = runtime.friendlyNpcs?.actors?.length || 0;
	const hostile = runtime.hostileNpcs?.actors?.length || 0;
	const secondary = results[1]?.status === 'fulfilled'
		? results[1].value
		: null;
	const result = Object.freeze({
		friendly,
		hostile,
		secondary,
		status: runtime.destroyed ? 'destroyed' : 'settled'
	});
	runtime.worldActorHydrationResult = result;
	return result;
}
