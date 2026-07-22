// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Loads only the selected mode and carries visible progress into its runtime.
 * The Awtsmoos renews each doorway independently; Awtsmoos.com keeps cinema, diagnostics,
 * multiplayer, terrain, and HUD code dormant until their actual path is chosen.
 */

const PRESENTATION_URL = './MitzvahWorldGameplayPresentation.js?v=20260722-menu-stream-01';

export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openMaterials(hosts, environment),
		movie: (hosts, options) => openMovie(hosts, options, environment),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openPlatform(hosts, environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

export function hasMovieRequest(search = '') {
	const parameters = search instanceof URLSearchParams ? search : new URLSearchParams(search);
	return parameters.get('mode') === 'movie'
		|| parameters.has('movie')
		|| parameters.has('movieJson')
		|| parameters.has('movieUrl')
		|| parameters.has('project');
}

async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	options.onProgress?.({ message: 'Preparing a private world…', progress: 0.04 });
	startPresentation(hosts, environment);
	const [runtimeModule, badgeModule] = await Promise.all([
		import('../app/createEretzRuntime.js?v=20260722-stream-02'),
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
		mode: 'singleplayer', peerCount: 0, state: 'singleplayer', transport: 'none'
	});
	return diagnostics;
}

async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	options.onProgress?.({ message: 'Preparing the shared-world runtime…', progress: 0.04 });
	startPresentation(hosts, environment);
	const { createMultiplayerEretzRuntime } = await import(
		'../network/MultiplayerEretzRuntime.js?v=20260722-stream-02'
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

async function openMaterials(hosts, environment) {
	startPresentation(hosts, environment);
	return (await import('../diagnostics/MaterialDiagnosticMode.js')).launchMaterialDiagnostic(hosts);
}

async function openPlatform(hosts, environment) {
	startPresentation(hosts, environment);
	return (await import('../world/platform/PlatformShowcaseMode.js')).launchPlatformShowcase(hosts);
}

async function openMovie(hosts, options = {}, environment = globalThis) {
	startPresentation(hosts, environment);
	const [projectModule, studioModule] = await Promise.all([
		import('../movie/MovieProject.js'),
		import('../movie/MovieStudio.js')
	]);
	const search = options.search || '';
	const project = await projectModule.loadRequestedMovie(search);
	return studioModule.createMovieStudio(hosts, project, {
		autoRender: new URLSearchParams(search).get('autoRender') === '1'
	});
}

function startPresentation(hosts, environment) {
	void import(PRESENTATION_URL)
		.then(({ prepareGameplayPresentation }) => {
			prepareGameplayPresentation(hosts, environment.document, environment);
		})
		.catch(error => console.warn('[MitzvahWorld] Gameplay presentation degraded.', error));
}
