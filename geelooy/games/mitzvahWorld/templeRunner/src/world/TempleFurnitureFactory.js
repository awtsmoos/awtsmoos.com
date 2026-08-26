// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleFurnitureFactory.js
 * @description Builds non-colliding market furniture with shared oak and ceramic surface realism through Awtsmoos procedural core.
 * The Awtsmoos renews bench, cart, barrel, basket, and vessel before the street can feel alive;
 * Awtsmoos.com lets wood grain and pottery weather softly while every curbside prop remains outside the runner's law and lanes survive.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { WORLD_COLORS } from "../config.js";

const STATIC_MODEL = Object.freeze({ static: true });

export class TempleFurnitureFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/** @param {number} x World X. @param {number} z Local Z. @returns {object} */
	createBench(x, z) {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "JerusalemBenchSeat",
			position: [x, 0.58, z],
			scale: [1.7, 0.2, 0.7],
			color: WORLD_COLORS.wood,
			surface: "wood",
			worldModel: STATIC_MODEL
		}));
		root.add(this.meshFactory.cube({
			name: "JerusalemBenchBack",
			position: [x, 1.02, z + 0.26],
			scale: [1.7, 0.72, 0.14],
			color: WORLD_COLORS.wood,
			surface: "wood",
			worldModel: STATIC_MODEL
		}));
		return root;
	}

	/** @param {number} x World X. @param {number} z Local Z. @returns {object} */
	createCart(x, z) {
		const root = new Group();
		root.add(this.meshFactory.cube({
			name: "MarketCart",
			position: [x, 0.78, z],
			scale: [1.75, 0.88, 1.0],
			color: WORLD_COLORS.wood,
			surface: "wood",
			worldModel: STATIC_MODEL
		}));
		for (const wheelX of [-0.7, 0.7]) {
			root.add(this.meshFactory.cylinder({
				name: "MarketCartWheel",
				parameters: {
					radiusTop: 0.32,
					radiusBottom: 0.32,
					height: 0.16,
					radialSegments: 12
				},
				position: [x + wheelX, 0.3, z],
				rotation: [0, 0, Math.PI / 2],
				color: WORLD_COLORS.stoneDark,
				worldModel: STATIC_MODEL
			}));
		}
		return root;
	}

	/** @param {number} x World X. @param {number} z Local Z. @returns {object} */
	createVessels(x, z) {
		const root = new Group();
		for (const offset of [-0.45, 0.25]) {
			root.add(this.meshFactory.cylinder({
				name: "WaterVessel",
				parameters: {
					radiusTop: 0.28,
					radiusBottom: 0.42,
					height: 1.15,
					radialSegments: 12
				},
				position: [x + offset, 0.58, z],
				color: [0.54, 0.35, 0.19, 1],
				surface: "pottery",
				worldModel: STATIC_MODEL
			}));
		}
		return root;
	}

	/** @param {number} x World X. @param {number} z Local Z. @returns {object} */
	createBarrel(x, z) {
		return this.meshFactory.cylinder({
			name: "MarketBarrel",
			parameters: {
				radiusTop: 0.38,
				radiusBottom: 0.42,
				height: 0.92,
				radialSegments: 12
			},
			position: [x, 0.46, z],
			color: WORLD_COLORS.wood,
			surface: "wood",
			worldModel: STATIC_MODEL
		});
	}
}
