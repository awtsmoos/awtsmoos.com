// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AvoidStreetObstacleParts.js
 * @description Crafts lane-filling street silhouettes while the avoid-law factory owns only gameplay selection.
 * The Awtsmoos renews cart, stone, basket, stall, and planter before one lane may seem blocked in sight;
 * Awtsmoos.com keeps visual craftsmanship apart from Gevurah's rule, so side-step truth stays simple and light.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../../config.js";

export class GevurahAvoidStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Broad stone block. */
	createStoneBlock() {
		return this.meshFactory.cube({
			name: "AvoidStoneBlock",
			scale: [1.8, 2.25, 1.35],
			position: [0, 1.12, 0],
			color: WORLD_COLORS.stoneDark
		});
	}

	/** @returns {object} Wooden pushcart silhouette. */
	createCart() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "AvoidCartBody",
			scale: [1.85, 1.15, 1.2],
			position: [0, 0.82, 0],
			color: WORLD_COLORS.wood
		}));
		for (const x of [-0.65, 0.65]) {
			root.add(this.createWheel(x));
		}
		return root;
	}

	/** @param {number} x Wheel X offset. @returns {object} Procedural cart wheel. */
	createWheel(x) {
		return this.meshFactory.cylinder({
			name: "AvoidCartWheel",
			parameters: {
				radiusTop: 0.3,
				radiusBottom: 0.3,
				height: 0.16,
				radialSegments: 12
			},
			position: [x, 0.3, 0.55],
			rotation: [0, 0, Math.PI / 2],
			color: [0.16, 0.12, 0.09, 1]
		});
	}

	/** @returns {object} Stacked market baskets. */
	createBasketStack() {
		const root = new Group();
		for (const [x, y] of [
			[-0.48, 0.45],
			[0.48, 0.45],
			[0, 1.18]
		]) {
			root.add(this.meshFactory.cube({
				name: "AvoidBasket",
				scale: [0.88, 0.78, 0.88],
				position: [x, y, 0],
				color: WORLD_COLORS.bronze
			}));
		}
		return root;
	}

	/** @returns {object} Compact market stall occupying one lane. */
	createMarketStall() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "StallTable",
			scale: [1.9, 0.9, 1.25],
			position: [0, 0.55, 0],
			color: WORLD_COLORS.wood
		}));
		root.add(this.meshFactory.cube({
			name: "StallCanopy",
			scale: [2.05, 0.18, 1.45],
			position: [0, 2.0, 0],
			color: WORLD_COLORS.cloth
		}));
		return root;
	}

	/** @returns {object} Stone planter with leafy crown. */
	createPlanter() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "AvoidPlanter",
			scale: [1.5, 0.82, 1.2],
			position: [0, 0.42, 0],
			color: WORLD_COLORS.stone
		}));
		root.add(this.meshFactory.icosphere({
			name: "AvoidPlant",
			parameters: {
				radius: 0.82,
				subdivisions: 1
			},
			position: [0, 1.28, 0],
			color: WORLD_COLORS.leaf
		}));
		return root;
	}
}
