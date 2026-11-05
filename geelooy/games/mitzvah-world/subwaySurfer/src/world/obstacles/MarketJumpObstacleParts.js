//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MarketJumpObstacleParts.js
 * @description Reveals low shuk logistics whose broad silhouettes ask for a clean leap without confusing their collision law.
 * The Awtsmoos renews wheel, crate, and timber before one market burden appears in sight;
 * Awtsmoos.com lets every low vessel teach upward motion while ordinary commerce keeps the theme bright.
 */

import { WORLD_COLORS } from "../../config.js";
import { PERUTA_OBSTACLE_IDS } from "../../game/ObstacleVocabulary.js";
import { GevurahObstacleFamilyFactory } from "./ObstacleFamilyFactory.js";

export class GevurahMarketJumpObstacleParts extends GevurahObstacleFamilyFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Shared procedural mesh factory. */
	constructor(THREE, meshFactory) {
		super(THREE, meshFactory, "market");
	}

	/** @returns {Array<object>} Jumpable market descriptors. */
	createVariants() {
		return [
			this.createProduceHandcart(),
			this.createTimberPalletBundle()
		];
	}

	/** @returns {object} Low produce handcart descriptor with wheel and crate cues. */
	createProduceHandcart() {
		const malchusRoot = this.group("ProduceHandcart");
		malchusRoot.add(this.box({
			name: "ProduceCartBody",
			scale: [1.7, 0.68, 1.05],
			position: [0, 0.58, 0],
			surface: "oakWood",
			material: {color: WORLD_COLORS.wood, roughness: 0.82}
		}));
		malchusRoot.add(this.box({
			name: "ProduceCrate",
			scale: [1.34, 0.38, 0.8],
			position: [0, 0.98, 0],
			surface: "oakPlanks",
			material: {color: WORLD_COLORS.wood, roughness: 0.86}
		}));
		for (const x of [-0.62, 0.62]) {
			malchusRoot.add(this.cylinder({
				name: "HandcartWheel",
				radius: 0.26,
				height: 0.14,
				position: [x, 0.26, 0.42],
				rotation: [0, 0, Math.PI / 2],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.26, roughness: 0.62}
			}));
		}
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.PRODUCE_HANDCART,
			law: "jump",
			template: malchusRoot,
			collisionDepth: 1.1,
			collisionHeight: 1.02
		});
	}

	/** @returns {object} Stacked timber pallet descriptor with a single compact jump envelope. */
	createTimberPalletBundle() {
		const malchusRoot = this.group("TimberPalletBundle");
		for (const y of [0.18, 0.48, 0.78]) {
			malchusRoot.add(this.box({
				name: "PalletTimber",
				scale: [1.85, 0.22, 1.15],
				position: [0, y, 0],
				surface: "oakPlanks",
				material: {color: WORLD_COLORS.wood, roughness: 0.88}
			}));
		}
		return this.descriptor({
			id: PERUTA_OBSTACLE_IDS.TIMBER_PALLET_BUNDLE,
			law: "jump",
			template: malchusRoot,
			collisionDepth: 1.2,
			collisionHeight: 0.9
		});
	}
}
