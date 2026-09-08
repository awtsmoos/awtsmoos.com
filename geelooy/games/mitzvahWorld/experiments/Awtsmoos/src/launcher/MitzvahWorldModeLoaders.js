// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Keeps Simple Meadow's pre-play graph narrow while deferring creative, badge, renderer-adjacent, and presentation systems until chosen or playable.
 * The Awtsmoos gives the first living step before ornament; Awtsmoos.com lets one tiny runtime doorway reach movement first,
 * while cinema, shared-world tools, and status adornments arrive only after their finite purpose is actually requested.
 */

import { reportDirectWorldProgress } from './MitzvahWorldDirectRuntimeOptions.js';

const CREATIVE_ROUTE_URL = './MitzvahWorldCreativeRouteLoader.js?compact=true&v=20260908-current-hot-path-03';
const MODE_AFTERCARE_URL = './MitzvahWorldModeAftercare.js?compact=true&v=20260908-current-hot-path-03';
const SINGLE_PLAYER_RUNTIME_URL = '../app/createEretzRuntime.js?compact=true&v=20260908-current-hot-path-03';
const SINGLE_PLAYER_OPTIONS_URL = './MitzvahWorldSinglePlayerRuntimeOptions.js?compact=true&v=20260908-current-hot-path-03';
const MULTIPLAYER_RUNTIME_URL = '../network/MultiplayerEretzRuntime.js?compact=true&v=20260804-map-01';
const DIRECT_OPTIONS_URL = './MitzvahWorldDirectRuntimeOptions.js?compact=true&v=20260908-current-hot-path-03';

export { hasMovieRequest } from './MitzvahWorldRouteQuery.js';

/** Returns route handlers whose optional graphs remain asleep until their route is chosen. */
export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openCreative('materials', hosts, {}, environment),
		movie: (hosts, options) => openCreative('movie', hosts, options, environment),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openCreative('platform', hosts, {}, environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

/** Opens local play through the runtime doorway before loading policy and every optional aftercare system. */
async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Opening the playable WebGL runtime…', {
		stage: 'single-player-runtime-module',
		url: SINGLE_PLAYER_RUNTIME_URL
	});
	const runtimeModule = await import(SINGLE_PLAYER_RUNTIME_URL);
	reportDirectWorldProgress(options, 'Choosing this local world experience…', {
		stage: 'single-player-world-policy',
		url: SINGLE_PLAYER_OPTIONS_URL
	});
	const optionsModule = await import(SINGLE_PLAYER_OPTIONS_URL);
	const runtimeOptions = optionsModule.createSinglePlayerWorldRuntimeOptions(options, environment);
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, runtimeOptions);
	markSinglePlayerSession(diagnostics);
	startModeAftercare('singlePlayer', diagnostics, environment, runtimeOptions);
	return diagnostics;
}

/** Opens shared multiplayer only when selected, preserving its separate transport/runtime graph. */
async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing the shared-world runtime…', {
		stage: 'multiplayer-runtime-module',
		url: MULTIPLAYER_RUNTIME_URL
	});
	const runtimeModule = await import(MULTIPLAYER_RUNTIME_URL);
	const optionsModule = await import(DIRECT_OPTIONS_URL);
	const diagnostics = await runtimeModule.createMultiplayerEretzRuntime(hosts, {
		...optionsModule.createDirectWorldRuntimeOptions(options, environment),
		WebSocketClass: environment.WebSocket,
		displayName: options.displayName,
		location: environment.location,
		url: options.realtimeUrl,
		worldId: options.worldId
	});
	startModeAftercare('multiplayer', diagnostics, environment, options);
	return diagnostics;
}

/** Loads creative capability only after its explicit route is chosen. */
async function openCreative(kind, hosts, options, environment) {
	const module = await import(CREATIVE_ROUTE_URL);
	if (kind === 'movie') {
		return module.openMitzvahWorldMovieCreative(hosts, options);
	}
	const method = kind === 'materials' ? 'openMaterialsMode' : 'openPlatformMode';
	return module.openPresentedMitzvahWorldCreative(method, hosts, '', environment);
}

/** Begins optional status and presentation after play without extending the route promise. */
function startModeAftercare(mode, diagnostics, environment, runtimeOptions) {
	diagnostics.modeAftercareStage = 'loading-module';
	diagnostics.modeAftercarePromise = import(MODE_AFTERCARE_URL)
		.then(module => module.startMitzvahWorldModeAftercare(
			mode,
			diagnostics,
			environment,
			runtimeOptions
		))
		.catch(error => {
			diagnostics.modeAftercareStage = 'degraded';
			diagnostics.modeAftercareError = error;
			return null;
		});
}

/** Publishes synchronous local-session identity before optional badge code arrives. */
function markSinglePlayerSession(diagnostics) {
	diagnostics.connectionBadge = null;
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
}
