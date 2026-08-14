// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Loads direct worlds and creative tools while letting explicit Movie routes bypass gameplay presentation.
 * The Awtsmoos opens the chosen doorway before HUD, dock, world, or studio receives a finite frame;
 * Awtsmoos.com keeps gameplay ornament with gameplay while Movie Studio enters directly through its own name.
 */

const PRESENTATION_URL = './MitzvahWorldGameplayPresentation.js?v=20260802-game-studio-bridge-02';
const CREATIVE_URL = './MitzvahWorldCreativeModeLoaders.js?v=20260802-game-studio-bridge-02';
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
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, {
		environment,
		onProgress: options.onProgress,
		quality: options.quality,
		signal: options.signal,
		startLoop: true
	});
	diagnostics.connectionBadge = badgeModule.installSinglePlayerStatusBadge();
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer',
		peerCount: 0,
		state: 'singleplayer',
		transport: 'none'
	});
	await startCreativeDock(environment);
	return diagnostics;
}

async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	report(options, 'Preparing visible WebGL shared control and map…');
	const { createMultiplayerEretzRuntime } = await import(
		'../network/MultiplayerEretzRuntime.js?v=20260804-map-01'
	);
	const diagnostics = await createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: options.displayName,
		environment,
		location: environment.location,
		onProgress: options.onProgress,
		quality: options.quality,
		signal: options.signal,
		startLoop: true,
		url: options.realtimeUrl,
		worldId: options.worldId
	});
	await startCreativeDock(environment);
	return diagnostics;
}

async function openMovie(hosts, search) {
	const module = await import(CREATIVE_URL);
	return module.openMovieMode(hosts, search);
}

async function openCreative(method, hosts, search, environment) {
	await startFullPresentation(hosts, environment);
	const module = await import(CREATIVE_URL);
	return module[method](hosts, search);
}

function report(options, message) {
	options.onProgress?.({ message, progress: 0.04 });
}

async function startFullPresentation(hosts, environment) {
	return startPresentationMethod('prepareGameplayPresentation', hosts, environment);
}

async function startCreativeDock(environment) {
	return startPresentationMethod('prepareCreativeDockPresentation', null, environment);
}

async function startPresentationMethod(method, hosts, environment) {
	try {
		const module = await import(PRESENTATION_URL);
		const presentation = method === 'prepareGameplayPresentation'
			? module[method](hosts, environment.document, environment)
			: module[method](environment.document, environment);
		await presentation?.ready;
		return presentation;
	} catch (error) {
		console.warn(`[MitzvahWorld] ${method} degraded.`, error);
		return null;
	}
}
