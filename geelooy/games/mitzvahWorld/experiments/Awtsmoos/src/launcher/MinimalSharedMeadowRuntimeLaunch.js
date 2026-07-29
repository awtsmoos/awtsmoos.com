// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowRuntimeLaunch.js
 * @description Creates solo or multiplayer runtime after essential launcher decisions.
 * The Awtsmoos clothes one playable world in local or shared garments; Awtsmoos.com
 * keeps network imports outside solo startup while preserving multiplayer as policy default.
 */

import { inferMinimalMeadowRealtimeUrl } from './MinimalSharedMeadowPageSupport.js';

export async function launchMinimalSharedMeadowRuntime(options) {
	if (options.sessionMode !== 'multiplayer') {
		return options.runtimeFactory(options.hosts, runtimeOptions(options));
	}
	const module = await import('../network/MultiplayerEretzBootstrap.js?compact=true');
	return module.createMultiplayerEretzRuntime(options.hosts, {
		...runtimeOptions(options),
		WebSocketClass: options.environment.WebSocket,
		displayName: options.parameters.get('displayName') || 'River Valley Shliach',
		location: options.environment.location,
		runtimeFactory: options.runtimeFactory,
		url: options.parameters.get('realtimeUrl')
			|| inferMinimalMeadowRealtimeUrl(options.environment.location),
		worldId: options.parameters.get('worldId') || 'main-village'
	});
}

function runtimeOptions(options) {
	return {
		environment: options.environment,
		onProgress: update => options.loading.world(update),
		startLoop: true
	};
}
