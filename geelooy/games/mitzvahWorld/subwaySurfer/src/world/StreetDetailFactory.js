// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every curbside sign of human scale before the runner can pass;
 * Awtsmoos.com adds crossing, bench, bollard, and utility so the street feels lived, not mass.
 */

import { WORLD_COLORS } from "../config.js";

export class MedaberStreetDetailFactory {
	/** @param {object} THREE Three.js namespace. @param {object} meshFactory Procedural mesh factory. @param {object} profile Quality profile. */
	constructor(THREE, meshFactory, profile) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
		this.profile = profile;
	}

	/** @param {number} index Chunk variation index. @returns {object} Non-colliding street-detail group. */
	create(index) {
		const root = new this.THREE.Group();
		root.name = "ProceduralStreetDetails";
		if (index % 4 === 0) this.addCrosswalk(root);
		this.addBollards(root, index);
		if (this.profile.detailLevel > 1) root.add(this.createBench(index));
		if (this.profile.detailLevel > 1) root.add(this.createUtilityBox(index));
		return root;
	}

	/** @param {object} root Detail group receiving shallow procedural stripes. */
	addCrosswalk(root) {
		for (let index = 0; index < 6; index += 1) {
			root.add(this.meshFactory.cube({
				name: "CrosswalkStripe",
				scale: [9.2, 0.025, 0.28],
				position: [0, 0.018, -2.5 + index],
				material: { type: "standard", color: WORLD_COLORS.lane, roughness: 0.78 },
				castShadow: false
			}));
		}
	}

	/** @param {object} root Detail group. @param {number} seed Deterministic chunk seed. */
	addBollards(root, seed) {
		const zOffset = seed % 2 ? 3.7 : -3.7;
		for (const side of [-1, 1]) {
			for (const offset of [-0.55, 0.55]) {
				root.add(this.meshFactory.cylinder({
					name: "StreetBollard",
					parameters: { radiusTop: 0.07, radiusBottom: 0.09, height: 0.72, radialSegments: 8, smooth: true },
					position: [side * 5.85, 0.36, zOffset + offset],
					material: { type: "standard", color: WORLD_COLORS.metal, metalness: 0.36, roughness: 0.52 }
				}));
			}
		}
	}

	/** @param {number} seed Deterministic variation seed. @returns {object} Procedural curbside bench. */
	createBench(seed) {
		const root = new this.THREE.Group();
		const side = seed % 2 ? -1 : 1;
		const x = side * 6.6;
		const z = seed % 3 ? -5.2 : 5.1;
		root.add(this.meshFactory.cube({
			name: "BenchSeat",
			scale: [0.55, 0.12, 1.45],
			position: [x, 0.62, z],
			material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.82 }
		}));
		root.add(this.meshFactory.cube({
			name: "BenchBack",
			scale: [0.12, 0.72, 1.45],
			position: [x + side * 0.3, 0.92, z],
			material: { type: "standard", color: WORLD_COLORS.wood, roughness: 0.84 }
		}));
		return root;
	}

	/** @param {number} seed Deterministic variation seed. @returns {object} Small utility cabinet. */
	createUtilityBox(seed) {
		const side = seed % 2 ? 1 : -1;
		return this.meshFactory.cube({
			name: "UtilityCabinet",
			scale: [0.48, 0.92, 0.62],
			position: [side * 6.35, 0.46, seed % 3 ? 6.2 : -6.0],
			material: { type: "standard", color: WORLD_COLORS.metal, metalness: 0.28, roughness: 0.62 }
		});
	}
}
