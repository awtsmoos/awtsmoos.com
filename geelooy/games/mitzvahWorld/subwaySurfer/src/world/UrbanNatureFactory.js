// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews root, branch, and leaf before the street can breathe;
 * Awtsmoos.com gives procedural nature layered crowns and planters beneath.
 */

import { WORLD_COLORS } from "../config.js";

export class TzomayachUrbanNatureFactory {
	/**
	 * @param {object} THREE Three.js namespace.
	 * @param {object} meshFactory Procedural mesh factory.
	 * @param {object} profile Quality profile.
	 */
	constructor(THREE, meshFactory, profile) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
		this.profile = profile;
	}

	/**
	 * Creates one deterministic layered urban tree.
	 * @param {number} side Street side, where -1 is left and 1 is right.
	 * @param {number} z Longitudinal position.
	 * @param {number} seed Deterministic variation seed.
	 * @returns {object} Procedural urban tree group.
	 */
	createTree(side, z, seed) {
		const root = new this.THREE.Group();
		const x = side * 6.75;
		root.name = "ProceduralUrbanTree";
		root.add(this.createPlanter(x, z));
		root.add(this.createTrunk(x, z));
		if (this.profile.detailLevel > 1) {
			this.addBranches(root, x, z, seed);
		}
		this.addCrowns(root, x, z, seed);
		return root;
	}

	/** @param {number} x World X. @param {number} z World Z. @returns {object} Stone planter. */
	createPlanter(x, z) {
		return this.meshFactory.cube({
			name: "TreePlanter",
			scale: [0.82, 0.28, 0.82],
			position: [x, 0.16, z],
			material: { type: "standard", color: WORLD_COLORS.stone, roughness: 0.94 }
		});
	}

	/** @param {number} x World X. @param {number} z World Z. @returns {object} Tapered procedural trunk. */
	createTrunk(x, z) {
		return this.meshFactory.cylinder({
			name: "TreeTrunk",
			parameters: {
				radiusTop: 0.11,
				radiusBottom: 0.2,
				height: 2.15,
				radialSegments: 8,
				smooth: true
			},
			position: [x, 1.22, z],
			material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.92 }
		});
	}

	/** Adds two angled procedural branches around the trunk. */
	addBranches(root, x, z, seed) {
		const lean = seed % 2 ? 1 : -1;
		for (const direction of [-1, 1]) {
			root.add(this.meshFactory.cylinder({
				name: "TreeBranch",
				parameters: {
					radiusTop: 0.045,
					radiusBottom: 0.075,
					height: 1.05,
					radialSegments: 7,
					smooth: true
				},
				position: [x + direction * 0.28, 2.1, z + direction * lean * 0.14],
				rotation: [direction * 0.18, 0, direction * 0.62],
				material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.94 }
			}));
		}
	}

	/** Adds quality-scaled clustered crown lobes around the branch canopy. */
	addCrowns(root, x, z, seed) {
		const count = this.profile.detailLevel === 1 ? 2 : 4;
		for (let index = 0; index < count; index += 1) {
			const angle = (index / count) * Math.PI * 2 + seed * 0.37;
			const radius = index === 0 ? 0.9 : 0.7;
			const color = index % 2 ? WORLD_COLORS.leafLight : WORLD_COLORS.leaf;
			root.add(this.meshFactory.icosphere({
				name: "TreeCrownLobe",
				parameters: { radius, subdivisions: 1, smooth: true },
				position: [x + Math.cos(angle) * 0.48, 2.75 + (index % 2) * 0.25, z + Math.sin(angle) * 0.48],
				material: { type: "standard", color, roughness: 0.9 }
			}));
		}
	}
}
