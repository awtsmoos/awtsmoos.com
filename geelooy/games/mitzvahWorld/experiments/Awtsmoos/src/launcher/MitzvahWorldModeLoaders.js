// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Opens playable worlds first while raw local module doors request compact server graphs and optional systems remain explicitly secondary.
 * The Awtsmoos reveals movement before ornament and purpose before display;
 * Awtsmoos.com keeps each browser doorway compact and each deeper chamber deferred, so speed grows without making the visible world noisy or wide.
 */

import {
	createDirectWorldRuntimeOptions,
	directWorldErrorReceipt,
	reportDirectWorldProgress
} from './MitzvahWorldDirectRuntimeOptions.js';

const CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
const CREATIVE_URL = './MitzvahWorldCreativeModeLoaders.js?compact=true&v=20260802-game-studio-bridge-02';
const DIRECT_EXPERIENCE_URL = `./MitzvahWorldDirectExperience.js?compact=true&v=${CAPSULE_VERSION}`;
const POST_PLAY_EXPERIENCE_URL = `./MitzvahWorldPostPlayExperience.js?compact=true&v=${CAPSULE_VERSION}`;
const SINGLE_PLAYER_RUNTIME_URL = '../app/createEretzRuntime.js?compact=true&v=20260804-map-01';

/** Returns the public route-loader covenant without exposing implementation details. */
export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openCreative('openMaterialsMode', hosts, '', environment),
		movie: (hosts, options) => openMovie(hosts, options?.search || ''),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openCreative('openPlatformMode', hosts, '', environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

/** Detects explicit Movie Studio requests while preserving historic query forms. */
export function hasMovieRequest(search = '') {
	const parameters = search instanceof URLSearchParams
		? search
		: new URLSearchParams(search);
	return parameters.get('mode') === 'movie'
		|| parameters.has('movie')
		|| parameters.has('movieJson')
		|| parameters.has('movieUrl')
		|| parameters.has('project');
}

async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing visible WebGL control and map…');
	const [runtimeModule, badgeModule] = await Promise.all([
		import(SINGLE_PLAYER_RUNTIME_URL),
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
	launchPostPlayExperience(diagnostics, environment);
	return diagnostics;
}

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
	launchPostPlayExperience(diagnostics, environment);
	return diagnostics;
}

async function openMovie(hosts, search) {
	const module = await import(CREATIVE_URL);
	return module.openMovieMode(hosts, search);
}

async function openCreative(method, hosts, search, environment) {
	const experience = await import(DIRECT_EXPERIENCE_URL);
	await experience.startMitzvahWorldFullPresentation(hosts, environment);
	const module = await import(CREATIVE_URL);
	return module[method](hosts, search);
}

function launchPostPlayExperience(diagnostics, environment) {
	const promise = import(POST_PLAY_EXPERIENCE_URL)
		.then(module => module.startMitzvahWorldPostPlayExperience(diagnostics, environment))
		.catch(error => {
			diagnostics.directExperienceBootstrapError = directWorldErrorReceipt(error);
			console.warn('[MitzvahWorld] post-play helper degraded.', error);
			return null;
		});
	diagnostics.directExperienceBootstrapPromise = promise;
	return promise;
}
