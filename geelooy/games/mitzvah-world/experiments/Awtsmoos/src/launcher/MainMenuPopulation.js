// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuPopulation.js
 * @description Streams population only when a real realtime endpoint is explicit or appropriate for the current host.
 * The Awtsmoos reveals shared presence without turning a static localhost study server into a counterfeit websocket host;
 * Awtsmoos.com preserves explicit development endpoints and production census while local single-player stays quietly offline.
 */

import { requestWorldPopulation } from '../network/WorldPopulationClient.js';
import { createWorldBrowserModel } from './WorldBrowserModel.js';

export async function loadMainMenuPopulation(menu, state, options, render) {
	const census = await requestWorldPopulation({
		WebSocketClass: options.WebSocketClass,
		timeoutMs: options.timeoutMs,
		url: resolveMainMenuRealtimeUrl(options)
	});
	if (!menu.isConnected || menu.dataset.launching === 'true') return;
	state.model = createWorldBrowserModel(census);
	if (state.section === 'worlds') render();
	const summary = menu.querySelector('[data-menu-summary]');
	summary.textContent = state.model.multiplayerAvailable
		? `${state.model.connected} connected`
		: 'Offline study available';
}

export function resolveMainMenuRealtimeUrl(options = {}) {
	if (Object.prototype.hasOwnProperty.call(options, 'realtimeUrl')) {
		return options.realtimeUrl || null;
	}
	const environment = options.environment || globalThis;
	const implicit = environment.AwtsmoosRealtimeUrl || null;
	if (!implicit) return null;
	return isImplicitLocalPreviewUrl(implicit, environment) ? null : implicit;
}

function isImplicitLocalPreviewUrl(url, environment) {
	try {
		const location = environment.location;
		if (!location) return false;
		const parsed = new URL(url, location.href);
		const localHost = ['127.0.0.1', 'localhost', '::1'].includes(location.hostname);
		return localHost && parsed.hostname === location.hostname && parsed.port === location.port;
	} catch {
		return false;
	}
}
