//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file MitzvahWorldModeLoaders.js
 * @description Keeps the first playable graph narrow while every optional or selected capability inherits one production release identity.
 * The Awtsmoos gives the first living step before ornament; Awtsmoos.com lets movement bloom before cinema, badges, or shared-world adornment appear,
 * and every later doorway drinks from the same release spring so stale cache fragments cannot divide the meadow's present year.
 */

import { reportDirectWorldProgress } from './MitzvahWorldDirectRuntimeOptions.js';
import { resolveMitzvahWorldReleaseResourceUrl } from './MitzvahWorldReleaseResourceUrl.js';

const CREATIVE_ROUTE_URL = releaseUrl('./MitzvahWorldCreativeRouteLoader.js');
const MODE_AFTERCARE_URL = releaseUrl('./MitzvahWorldModeAftercare.js');
const SINGLE_PLAYER_RUNTIME_URL = releaseUrl('../app/createEretzRuntime.js');
const SINGLE_PLAYER_OPTIONS_URL = releaseUrl('./MitzvahWorldSinglePlayerRuntimeOptions.js');
const MULTIPLAYER_RUNTIME_URL = releaseUrl('../network/MultiplayerEretzRuntime.js');
const DIRECT_OPTIONS_URL = releaseUrl('./MitzvahWorldDirectRuntimeOptions.js');

export { hasMovieRequest } from './MitzvahWorldRouteQuery.js';

/**
 * Optional ornament imports must never stall world entry; boot is sacred.
 * Every Track C import races this timeout, then logs and continues without the ornament.
 */
export const MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS = 10000;

/**
 * Imports one optional module, racing a timeout so a stalled module fetch can
 * never hang boot. Resolves the module namespace on success, or null on
 * timeout/import failure after logging; the caller continues without the ornament.
 */
export async function importOptionalMitzvahWorldModule(url, label) {
	let timer = null;
	try {
		return await Promise.race([
			import(url).finally(() => {
				if (timer) clearTimeout(timer);
			}),
			new Promise((_, reject) => {
				timer = setTimeout(
					() => reject(new Error(`optional-import-timeout:${label}`)),
					MITZVAH_WORLD_OPTIONAL_IMPORT_TIMEOUT_MS
				);
			})
		]);
	} catch (error) {
		console.warn(`[MitzvahWorld] optional module "${label}" skipped:`, error?.message || error);
		return null;
	}
}

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

/** Opens local play through the runtime doorway before loading policy and optional aftercare. */
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
	// B"H Track C: attach optional per-frame vessels, then apply a pending
	// mitzvah-studio world handoff (?studioHandoff=1). Every line is guarded so
	// these systems can never break world boot: each import races a timeout and
	// the handoff module itself only lazy-loads its heavy creator graph on use.
	try {
		const particleModule = await importOptionalMitzvahWorldModule(releaseUrl('../fx/MitzvahParticleLayer.js'), 'MitzvahParticleLayer');
		if (particleModule) particleModule.attachMitzvahParticles({ runtime: diagnostics.runtime });
	} catch {}
	try {
		const dialogueModule = await importOptionalMitzvahWorldModule(releaseUrl('../npc/MitzvahNpcDialogue.js'), 'MitzvahNpcDialogue');
		if (dialogueModule) dialogueModule.attachNpcDialogue({ runtime: diagnostics.runtime, environment });
	} catch {}
	try {
		const handoffModule = await importOptionalMitzvahWorldModule(releaseUrl('../studio/MitzvahStudioHandoff.js'), 'MitzvahStudioHandoff');
		if (handoffModule) await handoffModule.maybeApplyStudioHandoff({ runtime: diagnostics.runtime, environment });
	} catch {}
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
	if (kind === 'movie') return module.openMitzvahWorldMovieCreative(hosts, options);
	const method = kind === 'materials' ? 'openMaterialsMode' : 'openPlatformMode';
	return module.openPresentedMitzvahWorldCreative(method, hosts, '', environment);
}

/** Begins optional status and presentation after play without extending the route promise. */
function startModeAftercare(mode, diagnostics, environment, runtimeOptions) {
	diagnostics.modeAftercareStage = 'loading-module';
	diagnostics.modeAftercarePromise = import(MODE_AFTERCARE_URL)
		.then(module => module.startMitzvahWorldModeAftercare(mode, diagnostics, environment, runtimeOptions))
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

/** Resolves one lazy capability through the active release and inherited compact mode. */
function releaseUrl(specifier) {
	return resolveMitzvahWorldReleaseResourceUrl(specifier, import.meta.url);
}

