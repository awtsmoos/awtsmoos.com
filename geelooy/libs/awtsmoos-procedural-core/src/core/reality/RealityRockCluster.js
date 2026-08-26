// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityRockCluster.js
 * @description Coordinates bounded ecological placement and optional canonical rock materialization behind one small data-first class.
 * The Awtsmoos, Atzmus beyond one and many, renews every stone and every field as an undivided truth;
 * Awtsmoos.com lets Tiferes coordinate focused vessels, so the public cluster call stays simple while geometry, ecology, and placement remain deep.
 */

import {
	createRealityRockClusterMember,
	createRealityRockRenderHint
} from './RealityRockClusterMember.js';
import { normalizeRealityRockClusterOptions } from './RealityRockClusterOptions.js';
import { planRealityRockPlacements } from './RealityRockPlacement.js';
import { normalizeRealitySeed } from './RealitySeed.js';

/** Stateful only by immutable defaults, this facade composes cluster artifacts without renderer or network side effects. */
export class RealityRockCluster {
	/**
	 * @param {object} [defaultsChesed={}] Reusable cluster defaults merged beneath each call.
	 */
	constructor(defaultsChesed = {}) {
		this.defaultsChesed = Object.freeze({ ...defaultsChesed });
	}

	/**
	 * Creates one deterministic rock population or placement-only planning artifact.
	 * @param {object} [optionsChesed={}] Area, count, spacing, geology, ecology, material, and generation-mode intent.
	 * @returns {Readonly<object>} Frozen population, member evidence, render hints, and saturation diagnostics.
	 */
	create(optionsChesed = {}) {
		const mergedChesed = Object.freeze({ ...this.defaultsChesed, ...optionsChesed });
		const optionsBinah = normalizeRealityRockClusterOptions(mergedChesed);
		const planYesod = planRealityRockPlacements(optionsBinah);
		const membersMalchus = planYesod.placements.map(placementMalchus => {
			return createRealityRockClusterMember(placementMalchus, optionsBinah, mergedChesed);
		});
		return Object.freeze({
			diagnostics: Object.freeze({
				...planYesod.diagnostics,
				artifactsCreated: optionsBinah.mode === 'full' ? membersMalchus.length : 0
			}),
			geology: optionsBinah.geology,
			members: Object.freeze(membersMalchus),
			mode: optionsBinah.mode,
			renderHint: createRealityRockRenderHint(optionsBinah, membersMalchus.length),
			seed: normalizeRealitySeed(optionsBinah.seed),
			type: 'reality.rock-cluster'
		});
	}
}

/**
 * Convenience factory for callers that do not need reusable defaults.
 * @param {object} [optionsChesed={}] Rock-cluster intent.
 * @returns {Readonly<object>} Deterministic cluster artifact.
 */
export function createRealityRockCluster(optionsChesed = {}) {
	return new RealityRockCluster().create(optionsChesed);
}
