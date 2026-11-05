//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StreetDetailFactory.js
 * @description Adds sparse human-scale cues only where the active quality budget can afford them, letting photographic surfaces replace mesh clutter.
 * The Awtsmoos renews bench, crossing, and bollard while silence between them gives the eye room;
 * Awtsmoos.com lets one useful street sign outweigh six repeated meshes that burden every bloom.
 */

import { WORLD_COLORS } from "../config.js";

export class MedaberStreetDetailFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Mesh factory. @param {object} profile Quality profile. */
	constructor(THREE, meshFactory, profile) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
		this.profile = profile;
	}

	/** @param {number} index Chunk variation index. @returns {object} Sparse non-colliding detail group. */
	create(index) {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "BudgetedStreetDetails";
		if (this.profile.detailLevel >= 2 && index % 5 === 0) this.addCrosswalk(malchusRoot);
		if (index % 2 === 0) this.addBollards(malchusRoot, index);
		if (this.profile.detailLevel >= 3 && index % 3 === 1) malchusRoot.add(this.createBench(index));
		return malchusRoot;
	}

	/** @private */
	addCrosswalk(root) {
		for (const z of [-1.8, 0, 1.8]) {
			root.add(this.meshFactory.cube({
				name: "CrosswalkStripe",
				scale: [9.2, 0.025, 0.42],
				position: [0, 0.018, z],
				material: {color: WORLD_COLORS.lane, roughness: 0.78},
				castShadow: false,
				receiveShadow: false
			}));
		}
	}

	/** @private */
	addBollards(root, seed) {
		const z = seed % 4 ? 4.2 : -4.2;
		for (const side of [-1, 1]) {
			root.add(this.meshFactory.cylinder({
				name: "StreetBollard",
				parameters: {radiusTop: 0.07, radiusBottom: 0.09, height: 0.72, radialSegments: 6, smooth: true},
				position: [side * 5.85, 0.36, z],
				surface: "metal",
				material: {color: WORLD_COLORS.metal, metalness: 0.36, roughness: 0.52},
				castShadow: false
			}));
		}
	}

	/** @private */
	createBench(seed) {
		const malchusRoot = new this.THREE.Group();
		const side = seed % 2 ? -1 : 1;
		const x = side * 6.6;
		const z = seed % 3 ? -5.2 : 5.1;
		malchusRoot.add(this.meshFactory.cube({
			name: "BenchSeat",
			scale: [0.55, 0.14, 1.45],
			position: [x, 0.62, z],
			surface: "oakWood",
			material: {color: WORLD_COLORS.wood, roughness: 0.82},
			castShadow: false
		}));
		return malchusRoot;
	}
}
