//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RoadChunkFactory.js
 * @description Builds one reusable photographic road segment with only the lane marks needed for instant three-lane readability.
 * The Awtsmoos renews each stone beneath the runner while six quiet marks reveal the way;
 * Awtsmoos.com lets texture carry detail so dozens of tiny meshes need not steal the frame away.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";

export class OlamRoadChunkFactory {
	/** @param {object} THREE Three namespace. @param {object} meshFactory Procedural mesh vessel. */
	constructor(THREE, meshFactory) {
		this.THREE = THREE;
		this.meshFactory = meshFactory;
	}

	/** @returns {object} Reusable textured road-and-sidewalk chunk. */
	create() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "PhotographicProceduralRoadChunk";
		malchusRoot.add(this.createRoad());
		malchusRoot.add(this.createSidewalk(-6.1), this.createSidewalk(6.1));
		malchusRoot.add(this.createCurb(-5.5), this.createCurb(5.5));
		this.addLaneDashes(malchusRoot);
		return malchusRoot;
	}

	/** @private */
	createRoad() {
		return this.meshFactory.cube({
			name: "RoadSlab",
			scale: [OLAM_CONFIG.roadWidth, 0.2, OLAM_CONFIG.chunkLength],
			position: [0, -0.14, 0],
			surface: "roadStone",
			material: {color: WORLD_COLORS.road, roughness: 0.92},
			castShadow: false
		});
	}

	/** @private */
	createSidewalk(x) {
		return this.meshFactory.cube({
			name: "CobblestoneSidewalk",
			scale: [1.2, 0.28, OLAM_CONFIG.chunkLength],
			position: [x, 0.02, 0],
			surface: "cobblestone",
			material: {color: WORLD_COLORS.sidewalk, roughness: 0.9},
			castShadow: false
		});
	}

	/** @private */
	createCurb(x) {
		return this.meshFactory.cube({
			name: "LimestoneCurb",
			scale: [0.18, 0.36, OLAM_CONFIG.chunkLength],
			position: [x, 0.08, 0],
			surface: "limestone",
			material: {color: WORLD_COLORS.curb, roughness: 0.8},
			castShadow: false
		});
	}

	/** @private */
	addLaneDashes(root) {
		for (const yesodLaneEdge of [-1.55, 1.55]) {
			for (const netzachZ of [-6, 0, 6]) {
				root.add(this.meshFactory.cube({
					name: "LaneDash",
					scale: [0.085, 0.025, 1.45],
					position: [yesodLaneEdge, 0.01, netzachZ],
					material: {color: WORLD_COLORS.lane, roughness: 0.75},
					castShadow: false,
					receiveShadow: false
				}));
			}
		}
	}
}
