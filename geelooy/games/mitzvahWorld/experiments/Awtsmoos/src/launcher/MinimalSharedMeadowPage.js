// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Boots the exact shared meadow URL without menus or the authored-world graph.
 * The Awtsmoos opens one green vessel beneath one Chossid; Awtsmoos.com joins realtime only after
 * local sight and movement exist, so a distant socket can never hold the first visible frame.
 */

import {
	createMinimalMeadowRuntime
} from '../app/createMinimalMeadowRuntime.js?v=20260723-meadow-05';
import {
	createMultiplayerEretzRuntime
} from '../network/MultiplayerEretzBootstrap.js?v=20260723-meadow-05';

const HOST_IDS = Object.freeze({
	actionHost: 'actions',
	canvas: 'AwtsmoosCanvas',
	dialogueHost: 'npcDialogue',
	hud: 'hud',
	inventoryHost: 'inventory',
	joystickHost: 'joy',
	jumpHost: 'jump',
	npcHost: 'npcTarget'
});

export async function bootMinimalSharedMeadow(
	documentValue = document,
	environment = globalThis
) {
	const hosts = resolveHosts(documentValue);
	const parameters = new URLSearchParams(environment.location?.search || '');
	const sessionMode = parameters.get('session') || 'multiplayer';
	try {
		const diagnostics = sessionMode === 'singleplayer'
			? await createMinimalMeadowRuntime(hosts, { environment, startLoop: true })
			: await createSharedRuntime(hosts, parameters, environment);
		documentValue.documentElement.dataset.awtsmoosMenuReady = 'true';
		environment.AwtsmoosMitzvahWorld = diagnostics;
		return diagnostics;
	} catch (error) {
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

function createSharedRuntime(hosts, parameters, environment) {
	return createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: parameters.get('displayName') || 'Mountain Shliach',
		environment,
		location: environment.location,
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
		if (!element) throw new Error(`Missing minimal meadow host: #${id}`);
		hosts[name] = element;
	}
	return hosts;
}

function inferRealtimeUrl(locationValue) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) return null;
	const protocol = locationValue.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${protocol}//${locationValue.host}`;
}

function showFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	documentValue.documentElement.dataset.awtsmoosMenuReady = 'true';
	documentValue.documentElement.dataset.awtsmoosGameplay = 'false';
	hud.textContent = `B"H meadow startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}

if (typeof document !== 'undefined') await bootMinimalSharedMeadow();
