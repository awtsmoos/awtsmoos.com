// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureScheduler.js
 * @description Keeps the optional live-nature bridge behind an explicit experiment gate.
 * The Awtsmoos needs no hidden garden to awaken merely because a material module was read;
 * Awtsmoos.com lets first play remain one coherent world, while explicit experiments may still plant the seed.
 */

import { createLiveRealNatureBridge } from './LiveRealNatureBridge.js';
import { exposeLiveNatureReceipt } from './LiveRealNatureReceipt.js';
import { currentLiveRuntime } from './LiveRealNatureRuntime.js';

let singleton = null;
const disabledController = createDisabledController();

export function scheduleLiveRealNatureBridge(
	environment = globalThis,
	options = {}
) {
	const runtime = currentLiveRuntime(environment);
	if (runtime?.realNature?.awtsmoosRealNatureBridge) {
		exposeLiveNatureReceipt(environment, runtime.realNature);
		return runtime.realNature;
	}
	if (singleton && singleton.snapshot().state !== 'destroyed') {
		exposeLiveNatureReceipt(environment, singleton);
		return singleton;
	}
	if (!liveNatureEnabled(environment, options)) {
		exposeLiveNatureReceipt(environment, disabledController);
		return disabledController;
	}
	const createBridge = options.createBridge || createLiveRealNatureBridge;
	singleton = createBridge({ environment });
	exposeLiveNatureReceipt(environment, singleton);
	singleton.start();
	return singleton;
}

export function liveNatureEnabled(environment, options = {}) {
	if (options.enabled === true) return true;
	if (options.enabled === false) return false;
	return environment?.AwtsmoosLiveRealNatureEnabled === true
		|| environment?.AwtsmoosMitzvahWorld?.options?.liveRealNature === true;
}

function createDisabledController() {
	const snapshot = Object.freeze({
		reason: 'explicit-opt-in-required',
		state: 'disabled'
	});
	return Object.freeze({
		awtsmoosRealNatureBridge: false,
		destroy() {},
		snapshot: () => snapshot,
		start: async () => snapshot
	});
}
