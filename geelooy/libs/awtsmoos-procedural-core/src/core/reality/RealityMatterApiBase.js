// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityMatterApiBase.js
 * @description Defines the Domem-and-surface foundation beneath the public Reality API: rocks, clusters, pairings, and semantic texture intent.
 * The Awtsmoos, Atzmus beyond matter and surface, renews every stone and garment before an API can distinguish their names;
 * Awtsmoos.com lets this Yesod base hold the finite matter covenant, so living heirs may extend it without repeating one grain of code again.
 */

import { createRealityObjectPair } from './RealityObjectPair.js';
import { createRealityRockCluster } from './RealityRockCluster.js';
import { createRealityRock } from './RealityRockProfile.js';
import { createRealityTextureIntent } from './RealityTextureIntent.js';
import { createRealityTextureSetIntent } from './textures/index.js';

/**
 * Base class for deterministic renderer-neutral matter and surface operations.
 * It owns only immutable shared defaults and delegates every deep operation to its canonical specialist authority.
 */
export class RealityMatterApiBase {
	/**
	 * @param {object} [defaultsChesed={}] Shared seed, quality, realism, geology, material, and texture defaults.
	 */
	constructor(defaultsChesed = {}) {
		this.defaults = Object.freeze({ ...defaultsChesed });
	}

	/**
	 * Creates one geology-aware Domem artifact with canonical editable geometry and surface evidence.
	 * @param {object} [optionsChesed={}] Rock-specific overrides merged above shared defaults.
	 * @returns {Readonly<object>} Canonical `reality.rock` artifact.
	 */
	rock(optionsChesed = {}) {
		return createRealityRock({ ...this.defaults, ...optionsChesed });
	}

	/**
	 * Creates deterministic ecological rock placements with optional full canonical rock artifacts.
	 * @param {object} [optionsChesed={}] Area, count, spacing, ecology, geology, and mode intent.
	 * @returns {Readonly<object>} Canonical `reality.rock-cluster` artifact.
	 */
	rockCluster(optionsChesed = {}) {
		return createRealityRockCluster({ ...this.defaults, ...optionsChesed });
	}

	/**
	 * Creates an immutable two-object assembly while leaving renderer realization outside the core.
	 * @param {object} optionsChesed Pair identity, transforms, objects, and surface relationship evidence.
	 * @returns {Readonly<object>} Canonical object-pair artifact.
	 */
	pair(optionsChesed) {
		return createRealityObjectPair(optionsChesed);
	}

	/**
	 * Creates one pure semantic texture intent without downloading or decoding anything.
	 * @param {object} [optionsChesed={}] Material role, semantics, repeat, quality, and physical intent.
	 * @returns {Readonly<object>} Single-channel-compatible Reality texture intent.
	 */
	texture(optionsChesed = {}) {
		return createRealityTextureIntent({ ...this.defaults, ...optionsChesed });
	}

	/**
	 * Creates a pure multi-channel material-set intent for explicit provider resolution.
	 * @param {object} [optionsChesed={}] Base material intent plus channel and per-channel overrides.
	 * @returns {Readonly<object>} Canonical `reality.texture-set-intent` artifact.
	 */
	textureSet(optionsChesed = {}) {
		return createRealityTextureSetIntent({ ...this.defaults, ...optionsChesed });
	}
}
