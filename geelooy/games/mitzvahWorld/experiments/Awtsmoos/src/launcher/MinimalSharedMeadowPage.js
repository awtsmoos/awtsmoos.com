// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Boots the equipped river-valley forest meadow with measured progress.
 * The Awtsmoos opens local sight before distant connection; Awtsmoos.com binds every percentage
 * to garment, water normals, valley, trees, flowers, homes, demons, quest, UI, and renderer.
 */

import { createMinimalMeadowRuntime } from '../app/createMinimalMeadowRuntime.js?v=20260724-meadow-21';
import { createMultiplayerEretzRuntime } from '../network/MultiplayerEretzBootstrap.js?v=20260723-meadow-09';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js?v=20260723-meadow-07';
import { awaitMinimalMeadowReadiness } from './MinimalMeadowReadiness.js?v=20260724-meadow-21';

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

export async function bootMinimalSharedMeadow(documentValue = document, environment = globalThis) {
	const loading = new MeadowLoadingScreen(documentValue, environment);
	const hosts = resolveHosts(documentValue);
	const parameters = new URLSearchParams(environment.location?.search || '');
	const sessionMode = parameters.get('session') || 'multiplayer';
	try {
		const diagnostics = sessionMode === 'singleplayer'
			? await createSingleRuntime(hosts, environment, loading)
			: await createSharedRuntime(hosts, parameters, environment, loading);
		environment.AwtsmoosMitzvahWorld = diagnostics;
		await awaitMinimalMeadowReadiness(diagnostics, loading, documentValue, environment);
		loading.finish();
		return diagnostics;
	} catch (error) {
		loading.fail(error);
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

function createSingleRuntime(hosts, environment, loading) {
	return createMinimalMeadowRuntime(hosts, {
		environment,
		onProgress: update => loading.world(update),
		startLoop: true
	});
}

function createSharedRuntime(hosts, parameters, environment, loading) {
	return createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: parameters.get('displayName') || 'River Valley Shliach',
		environment,
		location: environment.location,
		onProgress: update => loading.world(update),
		runtimeFactory: createMinimalMeadowRuntime,
		startLoop: true,
		url: parameters.get('realtimeUrl') || inferRealtimeUrl(environment.location),
		worldId: parameters.get('worldId') || 'main-village'
	});
}

function resolveHosts(documentValue) {
	const hosts = {};
	for (const [name, id] of Object.entries(HOST_IDS)) {
		const element = documentValue.getElementById(id);
		if (!element) throw new Error(`Missing meadow host: #${id}`);
		hosts[name] = element;
	}
	return hosts;
}

function inferRealtimeUrl(locationValue) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	return `${locationValue.protocol === 'https:' ? 'wss:' : 'ws:'}//${locationValue.host}`;
}

function showFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	documentValue.documentElement.dataset.awtsmoosGameplay = 'false';
	hud.textContent = `B"H meadow startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}

if (typeof document !== 'undefined') await bootMinimalSharedMeadow();
