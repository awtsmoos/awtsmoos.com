// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AvoidObstacleFactory.js
 * @description Owns reusable slot selection for the single side-step law while street silhouettes live in a visual-parts vessel.
 * The Awtsmoos renews many blocking forms while Gevurah keeps one simple answer in the lane;
 * Awtsmoos.com lets visual variety deepen without ever making avoidance harder to explain.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { GevurahAvoidStreetObstacleParts } from "./AvoidStreetObstacleParts.js";

export class GevurahAvoidObstacleFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.parts = new GevurahAvoidStreetObstacleParts(meshFactory);
	}

	/** @returns {object} Reusable avoid-law slot. */
	createSlot() {
		const root = new Group();
		root.userData.law = "avoid";
		root.userData.collisionHeight = 2.2;
		root.userData.variants = [
			this.parts.createStoneBlock(),
			this.parts.createCart(),
			this.parts.createBasketStack(),
			this.parts.createMarketStall(),
			this.parts.createPlanter()
		];
		for (const variant of root.userData.variants) {
			variant.visible = false;
			root.add(variant);
		}
		root.visible = false;
		return root;
	}

	/**
	 * Selects one lane-blocking form without changing the avoid law.
	 * @param {object} slot Reusable avoid obstacle slot.
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
