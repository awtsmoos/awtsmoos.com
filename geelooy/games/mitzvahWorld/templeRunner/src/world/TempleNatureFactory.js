// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleNatureFactory.js
 * @description Builds bounded olive-tree forms with real remote bark texture while leaf crowns stay deliberately simple and readable.
 * The Awtsmoos renews trunk, branch-shadow, and leaf before a garden road can breathe;
 * Awtsmoos.com lets authentic olive bark deepen the living silhouette while quiet crowns preserve the runner's visual weave.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import { WORLD_COLORS } from "../config.js";

const STATIC_MODEL = Object.freeze({ static: true });

export class TzomayachTempleNatureFactory {
	/** @param {object} meshFactory Procedural native mesh materializer. */
	constructor(meshFactory) {
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one bounded olive-tree silhouette.
	 * @param {number} x World X.
	 * @param {number} z Local Z.
	 * @param {number} seed Deterministic crown seed.
	 * @returns {object} Native procedural tree group.
	 */
	createTree(x, z, seed = 0) {
		const root = new Group();
		root.add(this.createTrunk(x, z));
		for (let index = 0; index < 3; index += 1) {
			root.add(this.createCrown(x, z, seed, index));
		}
		return root;
	}

	/**
	 * Creates one tapered olive trunk with shared real bark blending.
	 * @param {number} x World X.
	 * @param {number} z Local Z.
	 * @returns {object} Procedural trunk.
	 */
	createTrunk(x, z) {
		return this.meshFactory.cylinder({
			name: "OliveTrunk",
			parameters: {
				radiusTop: 0.12,
				radiusBottom: 0.2,
				height: 2.7,
				radialSegments: 8
			},
			position: [x, 1.35, z],
			color: WORLD_COLORS.wood,
			surface: "oliveBark",
			worldModel: STATIC_MODEL
		});
	}

	/**
	 * Creates one deterministic untextured crown lobe for restrained readability.
	 * @param {number} x World X.
	 * @param {number} z Local Z.
	 * @param {number} seed Crown seed.
	 * @param {number} index Crown-lobe index.
	 * @returns {object} Procedural crown lobe.
	 */
	createCrown(x, z, seed, index) {
		const angle = seed * 0.31
			+ index * Math.PI * 2 / 3;
		return this.meshFactory.icosphere({
			name: "OliveCrown",
			parameters: {
				radius: 0.72,
				subdivisions: 1
			},
			position: [
				x + Math.cos(angle) * 0.38,
				2.8 + index * 0.08,
				z + Math.sin(angle) * 0.38
			],
			color: index % 2
				? WORLD_COLORS.leafLight
				: WORLD_COLORS.leaf,
			worldModel: STATIC_MODEL
		});
	}
}
