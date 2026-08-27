// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews the road beneath each step as distance streams by;
 * Awtsmoos.com forms every curb and lane through procedural light beneath the sky.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";

export class OlamRoadChunkFactory {
	/** @param {object} THREE Three.js namespace. @param {object} meshFactory Procedural mesh vessel. */
	constructor(THREE, meshFactory) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
	}

	/**
	 * Creates one reusable road-and-sidewalk chunk.
	 * @returns {object} Three.js Group containing only procedural geometry.
	 */
	create() {
		const root = new this.THREE.Group();
		root.name = "ProceduralRoadChunk";
		root.add(this.createRoad());
		root.add(this.createSidewalk(-6.1), this.createSidewalk(6.1));
		root.add(this.createCurb(-5.5), this.createCurb(5.5));
		this.addLaneDashes(root);
		return root;
	}

	/** @returns {object} Procedural asphalt slab. */
	createRoad() {
		return this.meshFactory.cube({
			name: "RoadSlab",
			scale: [OLAM_CONFIG.roadWidth, 0.2, OLAM_CONFIG.chunkLength],
			position: [0, -0.14, 0],
			material: { type: "standard", color: WORLD_COLORS.road, roughness: 0.92 },
			castShadow: false
		});
	}

	/** @param {number} x Sidewalk center X. @returns {object} Procedural sidewalk slab. */
	createSidewalk(x) {
		return this.meshFactory.cube({
			name: "Sidewalk",
			scale: [1.2, 0.28, OLAM_CONFIG.chunkLength],
			position: [x, 0.02, 0],
			material: { type: "standard", color: WORLD_COLORS.sidewalk, roughness: 0.9 },
			castShadow: false
		});
	}

	/** @param {number} x Curb center X. @returns {object} Procedural curb. */
	createCurb(x) {
		return this.meshFactory.cube({
			name: "Curb",
			scale: [0.18, 0.36, OLAM_CONFIG.chunkLength],
			position: [x, 0.08, 0],
			material: { type: "standard", color: WORLD_COLORS.curb, roughness: 0.8 },
			castShadow: false
		});
	}

	/** @param {object} root Chunk root receiving repeating procedural lane dashes. */
	addLaneDashes(root) {
		for (const laneEdge of [-1.55, 1.55]) {
			for (const z of [-7, -3.5, 0, 3.5, 7]) {
				root.add(this.meshFactory.cube({
					name: "LaneDash",
					scale: [0.09, 0.025, 1.25],
					position: [laneEdge, 0.01, z],
					material: { type: "standard", color: WORLD_COLORS.lane, roughness: 0.75 },
					castShadow: false
				}));
			}
		}
	}
}
