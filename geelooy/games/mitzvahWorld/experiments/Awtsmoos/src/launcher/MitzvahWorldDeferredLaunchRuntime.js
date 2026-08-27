//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldDeferredLaunchRuntime.js
 * @description Owns the heavier route capabilities that should exist only after a player actually chooses a MitzvahWorld doorway.
 * The Awtsmoos hides no truth yet reveals each vessel in its appointed hour; Awtsmoos.com keeps the first menu swift,
 * then lets world, cinema, platform, and shared-play machinery descend only when an intentional choice calls forth its power.
 */

import {
	createMitzvahWorldModeLoaders
} from './MitzvahWorldModeLoaders.js?v=20260814-direct-audio-02';
import {
	createMitzvahWorldRouteHandlers
} from './MitzvahWorldRouteHandlers.js?v=20260803-tagged-nature-03';
import {
	mitzvahWorldSessionMode
} from './MitzvahWorldSessionMode.js';

/**
 * @description Launches one non-menu route after this deferred capability module has been intentionally loaded.
 * @param {object} context Lightweight launcher context.
 * @param {string} route Canonical route identifier.
 * @returns {Promise<*>} Result produced by the selected route.
 */
export async function launchDeferredMitzvahWorldRoute(context, route) {
	const routes = createDeferredRoutes(context);

	if (route === 'materials') {
		context.revealHosts(context.hosts, false);
		return routes.modes.materials(context.hosts);
	}

	if (route === 'world') {
		const selection = Object.freeze({
			onProgress: context.dependencies.onProgress
		});
		return mitzvahWorldSessionMode(context.parameters) === 'singleplayer'
			? routes.handlers.openSinglePlayer(selection)
			: routes.handlers.openMultiplayer(selection);
	}

	if (route === 'platform') {
		return routes.handlers.openPlatform();
	}

	if (route === 'mission-movie') {
		return routes.handlers.openVillageMovie();
	}

	if (route === 'movie') {
		return routes.handlers.openMovie(context.search);
	}

	throw new Error(`Unsupported MitzvahWorld route: ${route}`);
}

/**
 * @description Launches one menu selection after the player explicitly chooses it.
 * @param {object} context Lightweight launcher context.
 * @param {object} selection Main menu selection and progress contract.
 * @returns {Promise<*>} Result produced by the selected menu route.
 */
export async function launchDeferredMitzvahWorldMenuSelection(context, selection = {}) {
	const routes = createDeferredRoutes(context);
	const handler = routes.handlers.menu?.[selection.mode];

	if (typeof handler !== 'function') {
		throw new Error(`No ${selection.mode || 'unknown'} launcher is installed.`);
	}

	return handler(selection);
}

/**
 * @description Constructs mode and route authorities only inside the deferred capability boundary.
 * @param {object} context Lightweight launcher context.
 * @returns {{handlers:object,modes:object}} Deferred mode and route authorities.
 */
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

	return {
		handlers,
		modes
	};
}
