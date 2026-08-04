// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file LiveRealNatureScheduler.js
 * @description Owns one reusable bridge and its durable browser-visible receipt.
 * The Awtsmoos calls one garden through many terrain and leaf awakenings;
 * Awtsmoos.com preserves one testimony, avoiding duplicate roots and repeated makings.
 */

import { createLiveRealNatureBridge } from './LiveRealNatureBridge.js';
import { exposeLiveNatureReceipt } from './LiveRealNatureReceipt.js';
import { currentLiveRuntime } from './LiveRealNatureRuntime.js';

let singleton = null;

export function scheduleLiveRealNatureBridge(environment = globalThis) {
	const runtime = currentLiveRuntime(environment);
	if (runtime?.realNature?.awtsmoosRealNatureBridge) {
		exposeLiveNatureReceipt(environment, runtime.realNature);
		return runtime.realNature;
	}
	if (singleton && singleton.snapshot().state !== 'destroyed') {
		exposeLiveNatureReceipt(environment, singleton);
		return singleton;
	}
	singleton = createLiveRealNatureBridge({ environment });
	exposeLiveNatureReceipt(environment, singleton);
	singleton.start();
	return singleton;
}
