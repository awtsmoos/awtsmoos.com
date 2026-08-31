//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Opens playable worlds first, resolves local experience policy only for single-player, and keeps each heavy runtime behind its appointed deferred door.
 * The Awtsmoos reveals movement before ornament while every doorway keeps its proper weight;
 * Awtsmoos.com lets Simple Meadow stay simple, Mountain Village grow rich, and multiplayer never inherit the wrong local fate.
 */

import {
	openMitzvahWorldMovieCreative,
	openPresentedMitzvahWorldCreative
} from './MitzvahWorldCreativeRouteLoader.js';
import {
	createDirectWorldRuntimeOptions,
	reportDirectWorldProgress
} from './MitzvahWorldDirectRuntimeOptions.js';
import { launchMitzvahWorldPostPlayByPolicy } from './MitzvahWorldPostPlayPolicy.js';
import { launchMitzvahWorldPostPlayExperience } from './MitzvahWorldPostPlayLoader.js';
import { createSinglePlayerWorldRuntimeOptions } from './MitzvahWorldSinglePlayerRuntimeOptions.js';

export { hasMovieRequest } from './MitzvahWorldRouteQuery.js';

/** Returns the public route-loader covenant without exposing implementation details. */
export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openPresentedMitzvahWorldCreative('openMaterialsMode', hosts, '', environment),
		movie: (hosts, options) => openMitzvahWorldMovieCreative(hosts, options),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openPresentedMitzvahWorldCreative('openPlatformMode', hosts, '', environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

/** Opens one local world with a single-player-only experience profile and profile-aware optional presentation. */
async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL control and map…');
	const [runtimeModule, badgeModule] = await Promise.all([
		import('../app/createEretzRuntime.js?compact=true&v=20260804-map-01'),
		import('../network/MultiplayerStatusBadge.js?compact=true')
	]);
	const runtimeOptions = createSinglePlayerWorldRuntimeOptions(options, environment);
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, runtimeOptions);
	diagnostics.connectionBadge = badgeModule.installSinglePlayerStatusBadge();
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	launchMitzvahWorldPostPlayByPolicy(diagnostics, environment, runtimeOptions);
	return diagnostics;
}

/** Opens the shared runtime with generic options so local fallback policy can never contaminate multiplayer. */
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
