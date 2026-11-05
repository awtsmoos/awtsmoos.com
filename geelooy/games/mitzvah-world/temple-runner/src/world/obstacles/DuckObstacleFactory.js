// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DuckObstacleFactory.js
 * @description Owns only the reusable slot and visual selection for the single duck gameplay law.
 * The Awtsmoos renews many overhead forms while one lowered answer remains clear in the lane;
 * Awtsmoos.com keeps gameplay law separate from street craft so children learn one simple game.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { GevurahDuckStreetObstacleParts } from "./DuckStreetObstacleParts.js";

export class GevurahDuckObstacleFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.parts = new GevurahDuckStreetObstacleParts(meshFactory);
	}

	/** @returns {object} Reusable duck-law slot. */
	createSlot() {
		const root = new Group();
		root.userData.law = "duck";
		root.userData.collisionHeight = 2.35;
		root.userData.variants = [
			this.parts.createAwning(),
			this.parts.createClothLine(),
			this.parts.createBeam(),
			this.parts.createBranch(),
			this.parts.createLintel()
		];
		for (const variant of root.userData.variants) {
			variant.visible = false;
			root.add(variant);
		}
		root.visible = false;
		return root;
	}

	/**
	 * Selects one overhead visual while preserving the duck law.
	 * @param {object} slot Reusable duck obstacle slot.
	 * @param {number} variantIndex Deterministic variant seed.
	 */
	configure(slot, variantIndex) {
		const selected = Math.abs(variantIndex)
			% slot.userData.variants.length;
		slot.userData.variant = selected;
		slot.userData.resolved = false;
		slot.userData.nearMissed = false;
		slot.visible = true;
		slot.userData.variants.forEach((variant, index) => {
			variant.visible = index === selected;
		});
	}
}
