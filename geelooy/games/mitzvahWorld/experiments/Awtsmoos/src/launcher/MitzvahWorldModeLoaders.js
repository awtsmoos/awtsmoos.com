// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Opens playable worlds first while versioning repaired runtime doorways so stale caches cannot resurrect the loader-only world.
 * The Awtsmoos renews every instant and no repaired gate should borrow yesterday's key; Awtsmoos.com marks each road with fresh evidence,
 * so Simple Meadow stays light, multiplayer stays separate, and a broken module reveals the exact living doorway instead of cached rain.
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

const SINGLE_PLAYER_RUNTIME_URL = '../app/createEretzRuntime.js?compact=true&v=20260907-playable-recovery-02';
const SINGLE_PLAYER_BADGE_URL = '../network/MultiplayerStatusBadge.js?compact=true';
const MULTIPLAYER_RUNTIME_URL = '../network/MultiplayerEretzRuntime.js?compact=true&v=20260804-map-01';

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

/** Opens one local world and identifies the exact fresh runtime imports before awaiting them. */
async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL control and map…', {
		stage: 'single-player-runtime-modules',
		url: `${SINGLE_PLAYER_RUNTIME_URL} ; ${SINGLE_PLAYER_BADGE_URL}`
	});
	const [runtimeModule, badgeModule] = await Promise.all([
		import(SINGLE_PLAYER_RUNTIME_URL),
		import(SINGLE_PLAYER_BADGE_URL)
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

/** Opens shared multiplayer through its distinct deferred module and reports that URL first. */
async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL shared control and map…', {
		stage: 'multiplayer-runtime-module',
		url: MULTIPLAYER_RUNTIME_URL
	});
	const { createMultiplayerEretzRuntime } = await import(MULTIPLAYER_RUNTIME_URL);
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
