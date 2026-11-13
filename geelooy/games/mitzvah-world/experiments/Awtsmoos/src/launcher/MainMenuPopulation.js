// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MainMenuPopulation.js
 * @description Streams population only when a real realtime endpoint is explicit or appropriate for the current host.
 * The Awtsmoos reveals shared presence without turning a static localhost study server into a counterfeit websocket host;
 * Awtsmoos.com preserves explicit development endpoints and production census while local single-player stays quietly offline.
 * One bounded retry keeps a single slow attempt on a high-latency connection (or a contended server) from leaving the menu
 * permanently offline; a missing endpoint stays silent at once and is never retried.
 */

import { requestWorldPopulation } from '../network/WorldPopulationClient.js';
import { createWorldBrowserModel } from './WorldBrowserModel.js';

// A census typically settles in under a second on a fast connection, but the
// socket open plus one round trip has been measured past two seconds from a
// fast host alone; fifteen seconds keeps a high-latency phone inside the
// budget while still bounding the menu's wait.
const POPULATION_TIMEOUT_MS = 15000;
const POPULATION_RETRY_DELAY_MS = 1000;
// The menu count used to be a one-shot fetch at load, so it went stale the
// moment another player joined (a second tab still read "0 connected" a
// minute after the first player entered). Re-read on the same 15s cadence
// the chat panel uses, until the menu is removed or a launch begins.
const POPULATION_POLL_INTERVAL_MS = 15000;
const pollTimers = new WeakMap();

export async function loadMainMenuPopulation(menu, state, options = {}, render) {
	const url = resolveMainMenuRealtimeUrl(options);
	const timeoutMs = options.timeoutMs ?? POPULATION_TIMEOUT_MS;
	let census = await requestWorldPopulation({
		WebSocketClass: options.WebSocketClass,
		timeoutMs,
		url
	});
	if (!census.available && url && menu.isConnected && menu.dataset.launching !== 'true') {
		await sleep(options.retryDelayMs ?? POPULATION_RETRY_DELAY_MS, options);
		if (!menu.isConnected || menu.dataset.launching === 'true') return;
		census = await requestWorldPopulation({
			WebSocketClass: options.WebSocketClass,
			timeoutMs,
			url
		});
	}
	if (!menu.isConnected || menu.dataset.launching === 'true') return;
	state.model = createWorldBrowserModel(census);
	if (state.section === 'worlds') render();
	const summary = menu.querySelector('[data-menu-summary]');
	summary.textContent = state.model.multiplayerAvailable
		? `${state.model.connected} connected`
		: 'Offline study available';
	startMainMenuPopulationPoll(menu, state, options, render);
}

export function startMainMenuPopulationPoll(menu, state, options = {}, render) {
	if (pollTimers.has(menu)) return;
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	if (!schedule) return;
	const cancel = options.cancelSchedule || globalThis.clearTimeout?.bind(globalThis);
	const tick = async () => {
		pollTimers.delete(menu);
		if (!menu.isConnected || menu.dataset.launching === 'true') return;
		await loadMainMenuPopulation(menu, state, options, render);
	};
	const timer = schedule(tick, options.pollIntervalMs ?? POPULATION_POLL_INTERVAL_MS);
	timer?.unref?.();
	pollTimers.set(menu, { cancel, timer });
}

export function stopMainMenuPopulationPoll(menu) {
	const entry = pollTimers.get(menu);
	if (!entry) return;
	pollTimers.delete(menu);
	entry.cancel?.(entry.timer);
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

function sleep(delayMs, options = {}) {
	const schedule = options.schedule || globalThis.setTimeout?.bind(globalThis);
	if (!schedule || delayMs <= 0) return Promise.resolve();
	return new Promise(resolve => schedule(resolve, delayMs));
}
