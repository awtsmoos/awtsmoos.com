// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JumpObstacleFactory.js
 * @description Owns only reusable slot selection for the single jump gameplay law through the generic native core.
 * The Awtsmoos renews many low forms while one rising answer remains clear to the eye;
 * Awtsmoos.com keeps gameplay law separate from street craftsmanship, so simple controls stay high.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { GevurahJumpStreetObstacleParts } from "./JumpStreetObstacleParts.js";

export class GevurahJumpObstacleFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.parts = new GevurahJumpStreetObstacleParts(meshFactory);
	}

	/** @returns {object} Reusable jump-law slot. */
	createSlot() {
		const root = new Group();
		root.userData.law = "jump";
		root.userData.collisionHeight = 0.95;
		root.userData.variants = [
			this.parts.createCrate(),
			this.parts.createBench(),
			this.parts.createStoneLedge(),
			this.parts.createBasket(),
			this.parts.createCartShaft()
		];
		for (const variant of root.userData.variants) {
			variant.visible = false;
			root.add(variant);
		}
		root.visible = false;
		return root;
	}

	/**
	 * Selects one low visual form without changing the jump law.
	 * @param {object} slot Reusable jump obstacle slot.
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
