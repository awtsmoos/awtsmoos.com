// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Loads direct worlds without menu presentation, CSS families, or HUD observers.
 * The Awtsmoos opens control before ornament; Awtsmoos.com keeps creative presentation,
 * diagnostics, cinema, rich panels, and responsive HUD code beyond their chosen doorways.
 */

const PRESENTATION_URL = './MitzvahWorldGameplayPresentation.js?v=20260722-menu-stream-01';
const CREATIVE_URL = './MitzvahWorldCreativeModeLoaders.js?v=20260722-webgl-stage-09';

export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openCreative('openMaterialsMode', hosts, '', environment),
		movie: (hosts, options) => openCreative(
			'openMovieMode',
			hosts,
			options?.search || '',
			environment
		),
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
	report(options, 'Preparing immediate WebGL control…');
	const [runtimeModule, badgeModule] = await Promise.all([
		import('../app/createEretzRuntime.js?v=20260722-stream-18'),
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
	return diagnostics;
}

async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	report(options, 'Preparing immediate WebGL shared control…');
	const { createMultiplayerEretzRuntime } = await import(
		'../network/MultiplayerEretzRuntime.js?v=20260722-stream-18'
	);
	return createMultiplayerEretzRuntime(hosts, {
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
}

async function openCreative(method, hosts, search, environment) {
	await startPresentation(hosts, environment);
	const module = await import(CREATIVE_URL);
	return module[method](hosts, search);
}

function report(options, message) {
	options.onProgress?.({ message, progress: 0.04 });
}

async function startPresentation(hosts, environment) {
	try {
		const module = await import(PRESENTATION_URL);
		return module.prepareGameplayPresentation(
			hosts,
			environment.document,
			environment
		);
	} catch (error) {
		console.warn('[MitzvahWorld] Creative presentation degraded.', error);
		return null;
	}
}
