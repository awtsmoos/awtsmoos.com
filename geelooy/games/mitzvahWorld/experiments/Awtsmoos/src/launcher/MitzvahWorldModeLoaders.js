// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Loads staged worlds and creative tools while attaching one lightweight direct-world experience.
 * The Awtsmoos opens the playable valley before ornament, then lets useful sound and passage arrive in rhyme;
 * Awtsmoos.com preserves staged realism, explicit Movie routes, and transport intent without duplicate worlds in time.
 */

const CREATIVE_URL = './MitzvahWorldCreativeModeLoaders.js?v=20260802-game-studio-bridge-02';
const DIRECT_EXPERIENCE_URL = './MitzvahWorldDirectExperience.js?v=20260814-direct-audio-01';
const SINGLE_PLAYER_RUNTIME_URL = '../app/createEretzRuntime.js?v=20260804-map-01';

export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openCreative('openMaterialsMode', hosts, '', environment),
		movie: (hosts, options) => openMovie(hosts, options?.search || ''),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openCreative('openPlatformMode', hosts, '', environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

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
	report(options, 'Preparing visible WebGL control and map…');
	const [runtimeModule, badgeModule] = await Promise.all([
		import(SINGLE_PLAYER_RUNTIME_URL),
		import('../network/MultiplayerStatusBadge.js')
	]);
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, runtimeOptions(options, environment));
	diagnostics.connectionBadge = badgeModule.installSinglePlayerStatusBadge();
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	diagnostics.directExperience = await startDirectExperience(diagnostics, environment);
	return diagnostics;
}

async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	report(options, 'Preparing visible WebGL shared control and map…');
	const { createMultiplayerEretzRuntime } = await import(
		'../network/MultiplayerEretzRuntime.js?v=20260804-map-01'
	);
	const diagnostics = await createMultiplayerEretzRuntime(hosts, {
		...runtimeOptions(options, environment),
		WebSocketClass: environment.WebSocket,
		displayName: options.displayName,
		location: environment.location,
		url: options.realtimeUrl,
		worldId: options.worldId
	});
	diagnostics.directExperience = await startDirectExperience(diagnostics, environment);
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

async function startDirectExperience(diagnostics, environment) {
	const module = await import(DIRECT_EXPERIENCE_URL);
	return module.startMitzvahWorldDirectExperience(diagnostics, environment);
}

function runtimeOptions(options, environment) {
	return {
		environment,
		onProgress: options.onProgress,
		quality: options.quality,
		signal: options.signal,
		startLoop: true
	};
}

function report(options, message) {
	options.onProgress?.({ message, progress: 0.04 });
}
