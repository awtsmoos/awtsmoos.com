//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Opens playable worlds first while keeping each heavy runtime behind a literal deferred module door.
 * The Awtsmoos reveals movement before ornament while every doorway keeps its appointed weight;
 * Awtsmoos.com lets the route shell stay light, and only the chosen world receives the deeper runtime beyond its gate.
 */

import {
	openMitzvahWorldMovieCreative,
	openPresentedMitzvahWorldCreative
} from './MitzvahWorldCreativeRouteLoader.js';
import {
	createDirectWorldRuntimeOptions,
	reportDirectWorldProgress
} from './MitzvahWorldDirectRuntimeOptions.js';
import {
	launchMitzvahWorldPostPlayExperience
} from './MitzvahWorldPostPlayLoader.js';

export {
	hasMovieRequest
} from './MitzvahWorldRouteQuery.js';

/**
 * @description Returns the public route-loader covenant without exposing implementation details.
 * @param {object} environment Browser-like runtime environment.
 * @returns {object} Frozen mode-loader contract.
 */
export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openPresentedMitzvahWorldCreative('openMaterialsMode', hosts, '', environment),
		movie: (hosts, options) => openMitzvahWorldMovieCreative(hosts, options),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openPresentedMitzvahWorldCreative('openPlatformMode', hosts, '', environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

/**
 * @description Opens one local single-player runtime through a literal dynamic import before optional post-play presentation.
 * @param {object} hosts Canonical game host elements.
 * @param {object} options Runtime launch options.
 * @param {object} environment Browser-like runtime environment.
 * @returns {Promise<object>} Single-player diagnostics.
 */
async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL control and map…');
	const [runtimeModule, badgeModule] = await Promise.all([
		import('../app/createEretzRuntime.js?compact=true&v=20260804-map-01'),
		import('../network/MultiplayerStatusBadge.js?compact=true')
	]);
	const diagnostics = await runtimeModule.createEretzRuntime(
		hosts,
		createDirectWorldRuntimeOptions(options, environment)
	);
	diagnostics.connectionBadge = badgeModule.installSinglePlayerStatusBadge();
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	launchMitzvahWorldPostPlayExperience(diagnostics, environment);
	return diagnostics;
}

/**
 * @description Opens the shared runtime through its literal deferred module door and then adds optional post-play presentation.
 * @param {object} hosts Canonical game host elements.
 * @param {object} options Shared-world launch options.
 * @param {object} environment Browser-like runtime environment.
 * @returns {Promise<object>} Multiplayer diagnostics.
 */
async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL shared control and map…');
	const { createMultiplayerEretzRuntime } = await import(
		'../network/MultiplayerEretzRuntime.js?compact=true&v=20260804-map-01'
	);
	const diagnostics = await createMultiplayerEretzRuntime(hosts, {
		...createDirectWorldRuntimeOptions(options, environment),
		WebSocketClass: environment.WebSocket,
		displayName: options.displayName,
		location: environment.location,
		url: options.realtimeUrl,
		worldId: options.worldId
	});
	launchMitzvahWorldPostPlayExperience(diagnostics, environment);
	return diagnostics;
}
