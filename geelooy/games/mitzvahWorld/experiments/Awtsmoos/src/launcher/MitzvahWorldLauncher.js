// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Routes direct worlds without importing the menu and population graph.
 * The Awtsmoos renews only the chosen doorway; Awtsmoos.com imports menu modules solely when
 * no direct mode exists, preserving identity, progress, visibility, and background realtime.
 */

import {
	createMitzvahWorldModeLoaders,
	hasMovieRequest
} from './MitzvahWorldModeLoaders.js?v=20260722-webgl-stage-09';
import { createMitzvahWorldRouteHandlers } from './MitzvahWorldRouteHandlers.js?v=20260722-webgl-stage-09';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

export async function launchMitzvahWorld(
	hosts,
	search = globalThis.location?.search || '',
	dependencies = {}
) {
	const parameters = new URLSearchParams(search);
	const environment = dependencies.environment || globalThis;
	const modes = dependencies.modeLoaders
		|| createMitzvahWorldModeLoaders(environment);
	const revealHosts = dependencies.setGameHostsVisible || setGameHostsVisible;
	const realtimeUrl = parameters.get('realtimeUrl')
		|| environment.AwtsmoosRealtimeUrl
		|| inferRealtimeUrl(environment.location);
	const routes = createMitzvahWorldRouteHandlers({
		environment,
		hosts,
		modes,
		parameters,
		realtimeUrl,
		revealHosts
	});
	if (parameters.get('mode') === 'materials') {
		revealHosts(hosts, false);
		return modes.materials(hosts);
	}
	if (parameters.get('mode') === 'world') {
		return mitzvahWorldSessionMode(parameters) === 'singleplayer'
			? routes.openSinglePlayer()
			: routes.openMultiplayer();
	}
	if (parameters.get('mode') === 'platform') return routes.openPlatform();
	if (parameters.get('mode') === 'mission-movie') return routes.openVillageMovie();
	if (hasMovieRequest(parameters)) return routes.openMovie(search);
	const menuModule = await import('./MainMenu.js?v=20260722-menu-only-01');
	const renderMenu = dependencies.showMainMenu || menuModule.showMainMenu;
	return renderMenu(hosts, routes.menu, {
		WebSocketClass: environment.WebSocket,
		environment,
		realtimeUrl
	});
}

export function setGameHostsVisible(hosts, visible) {
	for (const host of Object.values(hosts || {})) {
		if (host?.style) host.style.visibility = visible ? '' : 'hidden';
	}
}

export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) {
		return null;
	}
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

export default launchMitzvahWorld;
