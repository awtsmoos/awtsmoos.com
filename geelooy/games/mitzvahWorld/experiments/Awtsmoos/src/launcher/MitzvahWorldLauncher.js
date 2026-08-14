// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldLauncher.js
 * @description Routes one selected Mitzvah World doorway while forwarding canonical boot progress into the page-owned veil.
 * The Awtsmoos renews only the chosen entrance; Awtsmoos.com lets local study remain silent on static localhost,
 * shared worlds retain explicit realtime intent, and the one visible boot veil hears the same progress as the world it covers.
 */

import {
	createMitzvahWorldModeLoaders,
	hasMovieRequest
} from './MitzvahWorldModeLoaders.js?v=20260814-direct-audio-02';
import {
	createMitzvahWorldRouteHandlers
} from './MitzvahWorldRouteHandlers.js?v=20260803-tagged-nature-03';
import { mitzvahWorldSessionMode } from './MitzvahWorldSessionMode.js';

/** Launches exactly one selected route and forwards direct-world progress when supplied by the canonical page boot. */
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
	const realtimeUrl = resolveRealtimeUrl(parameters, environment);
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
		const selection = Object.freeze({
			onProgress: dependencies.onProgress
		});
		return mitzvahWorldSessionMode(parameters) === 'singleplayer'
			? routes.openSinglePlayer(selection)
			: routes.openMultiplayer(selection);
	}
	if (parameters.get('mode') === 'platform') return routes.openPlatform();
	if (parameters.get('mode') === 'mission-movie') return routes.openVillageMovie();
	if (hasMovieRequest(parameters)) return routes.openMovie(search);
	const menuModule = await import('./MainMenu.js?v=20260813-local-population-01');
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

export function resolveRealtimeUrl(parameters, environment = globalThis) {
	if (parameters?.has?.('realtimeUrl')) return parameters.get('realtimeUrl') || null;
	if (environment.AwtsmoosRealtimeUrl) return environment.AwtsmoosRealtimeUrl;
	return inferRealtimeUrl(environment.location);
}

export function inferRealtimeUrl(locationValue = globalThis.location) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	if (isStaticLocalPreview(locationValue)) return null;
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

function isStaticLocalPreview(locationValue) {
	return ['127.0.0.1', 'localhost', '::1'].includes(locationValue.hostname || '');
}

export default launchMitzvahWorld;
