// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Boots single-player core by default and imports multiplayer only when requested.
 * The Awtsmoos opens one playable gate before network and distant systems;
 * Awtsmoos.com keeps compact GLB, action bar, casting, and shared travel behind explicit doors.
 */

import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { awaitMinimalMeadowReadiness } from './MinimalMeadowReadiness.js';
import {
	createMitzvahWorldModeLoaders,
	hasMovieRequest
} from './MitzvahWorldModeLoaders.js';

const HOST_IDS = Object.freeze({
	actionHost: 'actions',
	canvas: 'AwtsmoosCanvas',
	combatFxHost: 'combatFx',
	dialogueHost: 'npcDialogue',
	gameRailHost: 'gameRail',
	hud: 'hud',
	inventoryHost: 'inventory',
	joystickHost: 'joy',
	jumpHost: 'jump',
	menuHost: 'meadowMenu',
	mobileShell: 'mobileControls',
	npcHost: 'npcTarget',
	playerHudShell: 'playerHudShell',
	targetHost: 'combatTarget'
});

/**
 * Boots the visible local game and observes optional feature readiness without awaiting it.
 * @param {Document} documentValue Active document.
 * @param {Window|object} environment Browser-like environment.
 * @param {object} dependencies Optional test/runtime dependency overrides.
 * @returns {Promise<object>} Core runtime diagnostics.
 */
export async function bootMinimalSharedMeadow(
	documentValue = document,
	environment = globalThis,
	dependencies = {}
) {
	const hosts = resolveHosts(documentValue);
	const parameters = new URLSearchParams(environment.location?.search || '');
	if (hasMovieRequest(parameters)) {
		return bootMovieRuntime(
			hosts,
			parameters,
			documentValue,
			environment,
			dependencies
		);
	}

	const loading = new MeadowLoadingScreen(documentValue, environment);
	const sessionMode = parameters.get('session') || 'singleplayer';
	try {
		const diagnostics = sessionMode === 'multiplayer'
			? await createSharedRuntime(
				hosts,
				parameters,
				environment,
				loading,
				dependencies
			)
			: await createSingleRuntime(
				hosts,
				environment,
				loading,
				dependencies
			);
		environment.AwtsmoosMitzvahWorld = diagnostics;
		await awaitMinimalMeadowReadiness(
			diagnostics,
			loading,
			documentValue,
			environment
		);
		loading.finish();
		documentValue.documentElement.dataset.awtsmoosSession = sessionMode;
		return diagnostics;
	} catch (error) {
		loading.fail(error);
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

async function bootMovieRuntime(
	hosts,
	parameters,
	documentValue,
	environment,
	dependencies
) {
	try {
		const loaders = dependencies.modeLoaders
			|| createMitzvahWorldModeLoaders(environment);
		const diagnostics = await loaders.movie(hosts, {
			search: environment.location?.search || parameters.toString()
		});
		environment.AwtsmoosMitzvahWorld = diagnostics;
		documentValue.documentElement.dataset.awtsmoosGameplay = 'true';
		documentValue.documentElement.dataset.awtsmoosSession = 'movie';
		return diagnostics;
	} catch (error) {
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

async function createSingleRuntime(hosts, environment, loading, dependencies) {
	const runtimeFactory = await minimalRuntimeFactory(dependencies);
	return runtimeFactory(hosts, {
		environment,
		onProgress: update => loading.world(update),
		startLoop: true
	});
}

async function createSharedRuntime(
	hosts,
	parameters,
	environment,
	loading,
	dependencies
) {
	const runtimeFactory = await minimalRuntimeFactory(dependencies);
	const module = await import('../network/MultiplayerEretzBootstrap.js?compact=true');
	return module.createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: parameters.get('displayName') || 'River Valley Shliach',
		environment,
		location: environment.location,
		onProgress: update => loading.world(update),
		runtimeFactory,
		startLoop: true,
		url: parameters.get('realtimeUrl') || inferRealtimeUrl(environment.location),
		worldId: parameters.get('worldId') || 'main-village'
	});
}

async function minimalRuntimeFactory(dependencies) {
	if (typeof dependencies.createMinimalMeadowRuntime === 'function') {
		return dependencies.createMinimalMeadowRuntime;
	}
	const module = await import('../app/createMinimalMeadowRuntime.js');
	return module.createMinimalMeadowRuntime;
}

function resolveHosts(documentValue) {
	const hosts = {};
	for (const [name, id] of Object.entries(HOST_IDS)) {
		const element = documentValue.getElementById(id);
		if (!element) {
			throw new Error(`Missing meadow host: #${id}`);
		}
		hosts[name] = element;
	}
	return hosts;
}

function inferRealtimeUrl(locationValue) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) {
		return null;
	}
	const scheme = locationValue.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${scheme}//${locationValue.host}`;
}

function showFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	documentValue.documentElement.dataset.awtsmoosGameplay = 'false';
	hud.textContent = `B"H meadow startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}

if (typeof document !== 'undefined') {
	globalThis.AwtsmoosMitzvahWorldBoot = bootMinimalSharedMeadow().catch(error => {
		console.error('[MitzvahWorld] compact boot failed.', error);
		throw error;
	});
}
