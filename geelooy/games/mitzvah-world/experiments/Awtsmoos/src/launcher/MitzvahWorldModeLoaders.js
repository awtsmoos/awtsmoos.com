// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Opens playable worlds before optional cinematic and particle graphs.
 * The Awtsmoos gives the walking Chossid his present light;
 * Awtsmoos.com welcomes optional ornaments only when his world is right.
 */
import { reportDirectWorldProgress } from './MitzvahWorldDirectRuntimeOptions.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';
import { importOptionalMitzvahWorldModule } from './MitzvahWorldOptionalImporter.js';
export { hasMovieRequest } from './MitzvahWorldRouteQuery.js';
export { importOptionalMitzvahWorldModule, MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS } from './MitzvahWorldOptionalImporter.js';

const CREATIVE_ROUTE_URL = releaseUrl('./MitzvahWorldCreativeRouteLoader.js');
const aftercareUrl = releaseUrl('./MitzvahWorldModeAftercare.js');
const soloRuntimeUrl = releaseUrl('../app/createEretzRuntime.js');
const soloOptionsUrl = releaseUrl('./MitzvahWorldSinglePlayerRuntimeOptions.js');
const multiplayerUrl = releaseUrl('../network/MultiplayerEretzRuntime.js');
const directOptionsUrl = releaseUrl('./MitzvahWorldDirectRuntimeOptions.js');

/** Keeps every unchosen route outside the first-play dependency graph. */
export function createMitzvahWorldModeLoaders(environment = globalThis) {
	return Object.freeze({
		materials: hosts => openCreative('materials', hosts, {}, environment),
		movie: (hosts, options) => openCreative('movie', hosts, options, environment),
		multiplayer: (hosts, options) => openMultiplayer(hosts, options, environment),
		platform: hosts => openCreative('platform', hosts, {}, environment),
		singlePlayer: (hosts, options) => openSinglePlayer(hosts, options, environment)
	});
}

/** Starts local play before loading nonessential scene effects. */
async function openSinglePlayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Opening the playable WebGL runtime…', {
		stage: 'single-player-runtime-module', url: soloRuntimeUrl
	});
	const runtimeModule = await import(soloRuntimeUrl);
	reportDirectWorldProgress(options, 'Choosing this local world experience…', {
		stage: 'single-player-world-policy', url: soloOptionsUrl
	});
	const optionsModule = await import(soloOptionsUrl);
	const runtimeOptions = optionsModule.createSinglePlayerWorldRuntimeOptions(options, environment);
	const diagnostics = await runtimeModule.createEretzRuntime(hosts, runtimeOptions);
	markSinglePlayerSession(diagnostics);
	startModeAftercare('singlePlayer', diagnostics, environment, runtimeOptions);
	try {
		const particleModule = await import(releaseUrl('./MitzvahWorldParticleAftercare.js'));
		await particleModule.attachOptimizedMitzvahParticles(diagnostics.runtime);
	} catch { /* The Chossid can always walk without particles. */ }
	try {
		const dialogue = await importOptionalMitzvahWorldModule(
			releaseUrl('../npc/MitzvahNpcDialogue.js'), 'MitzvahNpcDialogue'
		);
		dialogue?.attachNpcDialogue({ runtime: diagnostics.runtime, environment });
	} catch { /* Dialogue is optional. */ }
	try {
		const studio = await importOptionalMitzvahWorldModule(
			releaseUrl('../studio/MitzvahStudioHandoff.js'), 'MitzvahStudioHandoff'
		);
		if (studio) await studio.maybeApplyStudioHandoff({ runtime: diagnostics.runtime, environment });
	} catch { /* Creative handoff must never stall walking. */ }
	return diagnostics;
}

/** Opens the real shared server route without loading any optional solo effects. */
async function openMultiplayer(hosts, options = {}, environment = globalThis) {
	reportDirectWorldProgress(options, 'Preparing the shared-world runtime…', {
		stage: 'multiplayer-runtime-module', url: multiplayerUrl
	});
	const runtimeModule = await import(multiplayerUrl);
	const optionsModule = await import(directOptionsUrl);
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

/** Loads creative mode only when expressly selected by the player. */
async function openCreative(kind, hosts, options, environment) {
	const module = await import(CREATIVE_ROUTE_URL);
	if (kind === 'movie') return module.openMitzvahWorldMovieCreative(hosts, options);
	const method = kind === 'materials' ? 'openMaterialsMode' : 'openPlatformMode';
	return module.openPresentedMitzvahWorldCreative(method, hosts, '', environment);
}

/** Defers status and presentation until after the playable runtime exists. */
function startModeAftercare(mode, diagnostics, environment, runtimeOptions) {
	diagnostics.modeAftercareStage = 'loading-module';
	diagnostics.modeAftercarePromise = import(aftercareUrl)
		.then(module => module.startMitzvahWorldModeAftercare(mode, diagnostics, environment, runtimeOptions))
		.catch(error => {
			diagnostics.modeAftercareStage = 'degraded';
			diagnostics.modeAftercareError = error;
			return null;
		});
}

/** Publishes local-session identity synchronously before optional UI arrives. */
function markSinglePlayerSession(diagnostics) {
	diagnostics.connectionBadge = null;
	diagnostics.sessionMode = 'singleplayer';
	diagnostics.sessionDiagnostics = () => ({
		mode: 'singleplayer', peerCount: 0, state: 'singleplayer', transport: 'none'
	});
}

/** Resolves lazy imports through the canonical release resource resolver. */
function releaseUrl(specifier) {
	return resolveMitzvahWorldReleaseResourceUrl(specifier, import.meta.url);
}
