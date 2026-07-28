// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPage.js
 * @description Boots the requested creative doorway or the compact living meadow.
 * The Awtsmoos opens one truthful gate before network and distant systems; Awtsmoos.com
 * preserves the meadow for ordinary journeys while cinema receives its explicit luminous room.
 */

import {
	createMinimalMeadowRuntime
} from '../app/createMinimalMeadowRuntime.js?rev=20260728-full-wave-1';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';
import { openMinimalCreativeRoute } from './MinimalSharedCreativeRoute.js';
import { awaitMinimalMeadowReadiness } from './MinimalMeadowReadiness.js';
import {
	inferMinimalMeadowRealtimeUrl,
	resolveMinimalMeadowHosts,
	showMinimalMeadowBootFailure
} from './MinimalSharedMeadowPageSupport.js';

/**
 * Boots the explicitly requested movie editor or the visible game runtime.
 *
 * @param {Document} documentValue Active document.
 * @param {Window|object} environment Browser-like environment.
 * @returns {Promise<object>} Movie API or core runtime diagnostics.
 */
export async function bootMinimalSharedMeadow(
	documentValue = document,
	environment = globalThis
) {
	const hosts = resolveMinimalMeadowHosts(documentValue);
	const search = environment.location?.search || '';
	let loading = null;

	try {
		const creativeRoute = await openMinimalCreativeRoute(hosts, search);
		if (creativeRoute?.handled) {
			environment.AwtsmoosMitzvahWorld = creativeRoute.value;
			documentValue.documentElement.dataset.awtsmoosSession = 'movie';
			return creativeRoute.value;
		}
		loading = new MeadowLoadingScreen(documentValue, environment);
		const parameters = new URLSearchParams(search);
		const sessionMode = parameters.get('session') || 'singleplayer';
		const diagnostics = sessionMode === 'multiplayer'
			? await createSharedRuntime(hosts, parameters, environment, loading)
			: await createSingleRuntime(hosts, environment, loading);
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
		loading?.fail(error);
		showMinimalMeadowBootFailure(hosts.hud, documentValue, error);
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

async function createSharedRuntime(hosts, parameters, environment, loading) {
	const module = await import('../network/MultiplayerEretzBootstrap.js?compact=true');
	return module.createMultiplayerEretzRuntime(hosts, {
		WebSocketClass: environment.WebSocket,
		displayName: parameters.get('displayName') || 'River Valley Shliach',
		environment,
		location: environment.location,
		onProgress: update => loading.world(update),
		runtimeFactory: createMinimalMeadowRuntime,
		startLoop: true,
		url: parameters.get('realtimeUrl')
			|| inferMinimalMeadowRealtimeUrl(environment.location),
		worldId: parameters.get('worldId') || 'main-village'
	});
}

if (
	typeof document !== 'undefined'
	&& globalThis.AwtsmoosDisableAutoBoot !== true
) {
	globalThis.AwtsmoosMitzvahWorldBoot = bootMinimalSharedMeadow().catch(error => {
		console.error('[MitzvahWorld] compact boot failed.', error);
		throw error;
	});
}
