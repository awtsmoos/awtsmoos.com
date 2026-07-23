// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuPopulation.js
 * @description Streams authoritative population into an already interactive menu shell.
 * The Awtsmoos reveals shared presence without blocking private study; Awtsmoos.com updates
 * census evidence only while the menu remains connected and no world launch has begun.
 */

import { requestWorldPopulation } from '../network/WorldPopulationClient.js';
import { createWorldBrowserModel } from './WorldBrowserModel.js';

export async function loadMainMenuPopulation(menu, state, options, render) {
	const census = await requestWorldPopulation({
		WebSocketClass: options.WebSocketClass,
		timeoutMs: options.timeoutMs,
		url: options.realtimeUrl
	});
	if (!menu.isConnected || menu.dataset.launching === 'true') return;
	state.model = createWorldBrowserModel(census);
	if (state.section === 'worlds') render();
	const summary = menu.querySelector('[data-menu-summary]');
	summary.textContent = state.model.multiplayerAvailable
		? `${state.model.connected} connected`
		: 'Offline study available';
}
