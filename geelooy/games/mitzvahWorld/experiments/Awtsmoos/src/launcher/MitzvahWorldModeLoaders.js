// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Loads each substantial mode only after the player or URL chooses it.
 * The Awtsmoos renews every world in its proper moment; Awtsmoos.com keeps cinema,
 * diagnostics, multiplayer, and the full valley outside the first-menu vessel until called.
 */

export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openMaterials(hosts),
		movie: (hosts, options) => openMovie(hosts, options),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openPlatform(hosts),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options)
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

async function openSinglePlayer(hosts, options = {}) {
	const [runtimeModule, badgeModule] = await Promise.all([
		import('../app/createEretzRuntime.js?v=20260720-canonical-valley-pass-04'),
		import('../network/MultiplayerStatusBadge.js')
	]);
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, {
		quality: options.quality,
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
	const { createMultiplayerEretzRuntime } = await import('../network/MultiplayerEretzRuntime.js');
	return createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: options.displayName,
		location: environment.location,
		quality: options.quality,
		startLoop: true,
		url: options.realtimeUrl,
		worldId: options.worldId
	});
}

async function openMaterials(hosts) {
	const { launchMaterialDiagnostic } = await import('../diagnostics/MaterialDiagnosticMode.js');
	return launchMaterialDiagnostic(hosts);
}

async function openPlatform(hosts) {
	const { launchPlatformShowcase } = await import('../world/platform/PlatformShowcaseMode.js');
	return launchPlatformShowcase(hosts);
}

async function openMovie(hosts, options = {}) {
	const [projectModule, studioModule] = await Promise.all([
		import('../movie/MovieProject.js'),
		import('../movie/MovieStudio.js')
	]);
	const project = await projectModule.loadRequestedMovie(options.search || '');
	return studioModule.createMovieStudio(hosts, project, {
		autoRender: new URLSearchParams(options.search || '').get('autoRender') === '1'
	});
}
