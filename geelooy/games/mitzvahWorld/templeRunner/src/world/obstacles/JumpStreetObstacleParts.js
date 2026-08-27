// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file JumpStreetObstacleParts.js
 * @description Builds low obstacle silhouettes through the generic native core while jump-law gameplay remains separate.
 * The Awtsmoos renews crate, bench, ledge, basket, and shaft before any foot must rise;
 * Awtsmoos.com lets rich street forms live in their own keli while one simple jump remains the answer in the eyes.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import { WORLD_COLORS } from "../../config.js";

export class GevurahJumpStreetObstacleParts {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Wooden low crate. */
	createCrate() {
		return this.meshFactory.cube({
			name: "JumpCrate",
			scale: [1.5, 0.82, 1.15],
			position: [0, 0.41, 0],
			color: WORLD_COLORS.wood
		});
	}

	/** @returns {object} Low street bench. */
	createBench() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpBenchSeat",
			scale: [1.75, 0.16, 0.7],
			position: [0, 0.66, 0],
			color: WORLD_COLORS.wood
		}));
		for (const x of [-0.65, 0.65]) {
			root.add(this.meshFactory.cube({
				name: "JumpBenchLeg",
				scale: [0.14, 0.6, 0.14],
				position: [x, 0.3, 0],
				color: WORLD_COLORS.stoneDark
			}));
		}
		return root;
	}

	/** @returns {object} Broad low stone ledge. */
	createStoneLedge() {
		return this.meshFactory.cube({
			name: "JumpStoneLedge",
			scale: [1.85, 0.72, 1.2],
			position: [0, 0.36, 0],
			color: WORLD_COLORS.stone
		});
	}

	/** @returns {object} Wide produce-basket silhouette. */
	createBasket() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpBasket",
			scale: [1.62, 0.7, 1.05],
			position: [0, 0.35, 0],
			color: WORLD_COLORS.bronze
		}));
		root.add(this.meshFactory.icosphere({
			name: "BasketProduce",
			parameters: {
				radius: 0.42,
				subdivisions: 1
			},
			position: [0, 0.8, 0],
			color: WORLD_COLORS.leafLight
		}));
		return root;
	}

	/** @returns {object} Low cart shaft crossing the lane. */
	createCartShaft() {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JumpCartShaft",
			scale: [1.9, 0.18, 0.2],
			position: [0, 0.72, 0],
			color: WORLD_COLORS.wood
		}));
		root.add(this.meshFactory.cylinder({
			name: "JumpCartWheel",
			parameters: {
				radiusTop: 0.34,
				radiusBottom: 0.34,
				height: 0.16,
				radialSegments: 12
			},
			position: [0.7, 0.34, 0],
			rotation: [0, 0, Math.PI / 2],
			color: WORLD_COLORS.stoneDark
		}));
		return root;
	}
}
