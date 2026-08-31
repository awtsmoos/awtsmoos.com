//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldDeferredLaunchRuntime.js
 * @description Opens heavy route capabilities only after selection while preserving the chosen local or shared world identity through the deferred gate.
 * The Awtsmoos hides no truth yet reveals each vessel in its appointed hour; Awtsmoos.com keeps the menu swift and carries the chosen world into power.
 */

import { createMitzvahWorldModeLoaders } from './MitzvahWorldModeLoaders.js?v=20260814-direct-audio-02';
import { createMitzvahWorldRouteHandlers } from './MitzvahWorldRouteHandlers.js?v=20260803-tagged-nature-03';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

/** Launches one non-menu route after this deferred capability module has intentionally loaded. */
export async function launchDeferredMitzvahWorldRoute(context, route) {
	const routes = createDeferredRoutes(context);
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
	if (route === 'movie') return routes.handlers.openMovie(context.search);
	throw new Error(`Unsupported MitzvahWorld route: ${route}`);
}

/** Launches one real menu selection through the matching deferred route handler. */
export async function launchDeferredMitzvahWorldMenuSelection(context, selection = {}) {
	const routes = createDeferredRoutes(context);
	const handler = routes.handlers.menu?.[selection.mode];
	if (typeof handler !== 'function') {
		throw new Error(`No ${selection.mode || 'unknown'} launcher is installed.`);
	}
	return handler(selection);
}

/** Constructs mode and route authorities only inside the deferred capability boundary. */
function createDeferredRoutes(context) {
	const modes = context.dependencies.modeLoaders
		|| createMitzvahWorldModeLoaders(context.environment);
	const handlers = createMitzvahWorldRouteHandlers({
		environment: context.environment,
		hosts: context.hosts,
		modes,
		parameters: context.parameters,
		realtimeUrl: context.realtimeUrl,
		revealHosts: context.revealHosts
	});
	return { handlers, modes };
}
