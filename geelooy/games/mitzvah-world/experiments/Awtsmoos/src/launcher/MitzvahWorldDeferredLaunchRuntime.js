//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDeferredLaunchRuntime.js
 * @description Opens heavy route capabilities only after selection while every deferred doorway inherits the one active production release identity.
 * The Awtsmoos reveals each vessel in its appointed instant and never asks today's light to wear yesterday's key; Awtsmoos.com keeps the menu swift,
 * then sends the chosen world through one measured release river so no stale route handler can divide the meadow from the player's living gift.
 */

import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

const MODE_LOADERS_URL = resolveMitzvahWorldReleaseResourceUrl(
	'./MitzvahWorldModeLoaders.js',
	import.meta.url
);
const ROUTE_HANDLERS_URL = resolveMitzvahWorldReleaseResourceUrl(
	'./MitzvahWorldRouteHandlers.js',
	import.meta.url
);
let deferredAuthoritiesPromise = null;

/** Launches one non-menu route after this deferred capability boundary has intentionally loaded. */
export async function launchDeferredMitzvahWorldRoute(context, route) {
	const routes = await createDeferredRoutes(context, context.dependencies?.onProgress);
	if (route === 'materials') {
		context.revealHosts(context.hosts, false);
		return routes.modes.materials(context.hosts);
	}
	if (route === 'world') {
		const selection = Object.freeze({
			onProgress: context.dependencies.onProgress,
			worldId: context.parameters.get('worldId') || undefined
		});
		return mitzvahWorldSessionMode(context.parameters) === 'singleplayer'
			? routes.handlers.openSinglePlayer(selection)
			: routes.handlers.openMultiplayer(selection);
	}
	if (route === 'platform') return routes.handlers.openPlatform();
	if (route === 'mission-movie') return routes.handlers.openVillageMovie();
	if (route === 'movie') return routes.handlers.openMovie(context.search, {
		onProgress: context.dependencies?.onProgress
	});
	throw new Error(`Unsupported MitzvahWorld route: ${route}`);
}

/** Launches one menu selection through the matching deferred route handler. */
export async function launchDeferredMitzvahWorldMenuSelection(context, selection = {}) {
	// The selection carries the launch transaction's observed onProgress
	// (the one that re-arms the stall deadline); the context's dependencies
	// onProgress predates the transaction and cannot re-arm it.
	const routes = await createDeferredRoutes(
		context,
		selection.onProgress || context.dependencies?.onProgress
	);
	const handler = routes.handlers.menu?.[selection.mode];
	if (typeof handler !== 'function') {
		throw new Error(`No ${selection.mode || 'unknown'} launcher is installed.`);
	}
	return handler(selection);
}

/** Constructs mode and route authorities only inside the versioned deferred capability boundary. */
async function createDeferredRoutes(context, onProgress = null) {
	const authorities = await loadDeferredAuthorities(
		onProgress || context.dependencies?.onProgress
	);
	const modes = context.dependencies.modeLoaders
		|| authorities.createMitzvahWorldModeLoaders(context.environment);
	const handlers = authorities.createMitzvahWorldRouteHandlers({
		environment: context.environment,
		hosts: context.hosts,
		modes,
		parameters: context.parameters,
		realtimeUrl: context.realtimeUrl,
		revealHosts: context.revealHosts
	});
	return { handlers, modes };
}

/** Loads both deferred authorities once so they share one release identity and one retryable promise. */
async function loadDeferredAuthorities(onProgress = null) {
	if (!deferredAuthoritiesPromise) {
		// The menu launch transaction re-arms its 30s stall timer only on
		// progress reports, and nobody reports progress while these two
		// module imports are in flight — so a slow import on a contended
		// second tab tripped WORLD_ENTRY_STALL_TIMEOUT and the Join click
		// never navigated, even though the import would have settled. Report
		// progress while loading (the 90s hard timeout still bounds a hung
		// import), and once more when both modules resolve.
		const progress = typeof onProgress === 'function' ? onProgress : null;
		progress?.({ stage: 'deferred-authorities-loading' });
		const heartbeat = progress
			? setInterval(
				() => progress({ stage: 'deferred-authorities-loading' }),
				10000
			)
			: null;
		heartbeat?.unref?.();
		deferredAuthoritiesPromise = Promise.all([
			import(MODE_LOADERS_URL),
			import(ROUTE_HANDLERS_URL)
		]).then(([modeModule, routeModule]) => ({
			createMitzvahWorldModeLoaders: modeModule.createMitzvahWorldModeLoaders,
			createMitzvahWorldRouteHandlers: routeModule.createMitzvahWorldRouteHandlers
		})).catch(error => {
			deferredAuthoritiesPromise = null;
			throw error;
		}).finally(() => {
			if (heartbeat !== null) clearInterval(heartbeat);
			progress?.({ stage: 'deferred-authorities-loaded' });
		});
	}
	return deferredAuthoritiesPromise;
}
