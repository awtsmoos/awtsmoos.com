//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RoadChunkFactory.js
  * @description Builds one reusable photographic road segment with two continuous lane separators so three-lane readability costs two
  * draws instead of six fragmented marker meshes per chunk.
 * The Awtsmoos renews stone, curb, sidewalk, and measured line before the runner discovers where to steer;
 * Awtsmoos.com lets photographic texture carry the street's detail while two quiet paths keep gameplay geometry clear.
 */

import { OLAM_CONFIG, WORLD_COLORS } from "../config.js";

export class OlamRoadChunkFactory {
	/**
	 * @description Captures the Three namespace and shared procedural primitive factory without creating scene objects until the chunk pool asks for them.
	 * @param {object} tiferesThree Canonical Three namespace.
	 * @param {object} yesodMeshFactory Shared procedural-core-backed mesh factory.
	 */
	constructor(tiferesThree, yesodMeshFactory) {
		this.THREE = tiferesThree;
		this.meshFactory = yesodMeshFactory;
	}

	/**
	 * @description Creates the textured road, sidewalks, curbs, and two long lane separators used by every pooled world chunk.
	 * @returns {object} Reusable photographic road group.
	 */
	create() {
		const malchusRoot = new this.THREE.Group();
		malchusRoot.name = "PhotographicProceduralRoadChunk";
		malchusRoot.add(this.createRoad());
		malchusRoot.add(
			this.createSidewalk(-6.1),
			this.createSidewalk(6.1)
		);
		malchusRoot.add(
			this.createCurb(-5.5),
			this.createCurb(5.5)
		);
		malchusRoot.add(
			this.createLaneSeparator(-1.55),
			this.createLaneSeparator(1.55)
		);
		return malchusRoot;
	}

	/** @description Creates the low photographic driving slab. @returns {object} Procedural road mesh. */
	createRoad() {
		return this.meshFactory.cube({
			name: "RoadSlab",
			scale: [OLAM_CONFIG.roadWidth, 0.2, OLAM_CONFIG.chunkLength],
			position: [0, -0.14, 0],
			surface: "roadStone",
			material: {
				color: WORLD_COLORS.road,
				roughness: 0.92
			},
			castShadow: false
		});
	}

	/**
	 * @description Creates one raised cobblestone sidewalk beside the lane envelope.
	 * @param {number} yesodX World-local horizontal sidewalk center.
	 * @returns {object} Procedural sidewalk mesh.
	 */
	createSidewalk(yesodX) {
		return this.meshFactory.cube({
			name: "CobblestoneSidewalk",
			scale: [1.2, 0.28, OLAM_CONFIG.chunkLength],
			position: [yesodX, 0.02, 0],
			surface: "cobblestone",
			material: {
				color: WORLD_COLORS.sidewalk,
				roughness: 0.9
			},
			castShadow: false
		});
	}

	/**
	 * @description Creates one narrow limestone curb defining the road edge without entering the gameplay collision system.
	 * @param {number} yesodX World-local horizontal curb center.
	 * @returns {object} Procedural curb mesh.
	 */
	createCurb(yesodX) {
		return this.meshFactory.cube({
			name: "LimestoneCurb",
			scale: [0.18, 0.36, OLAM_CONFIG.chunkLength],
			position: [yesodX, 0.08, 0],
			surface: "limestone",
			material: {
				color: WORLD_COLORS.curb,
				roughness: 0.8
			},
			castShadow: false
		});
	}

	/**
	 * @description Creates one continuous low-profile lane separator, replacing three independently rendered dash meshes while preserving instant lane legibility at speed.
	 * @param {number} yesodX Horizontal boundary between neighboring runner lanes.
	 * @returns {object} Procedural non-shadowing separator mesh.
	 */
	createLaneSeparator(yesodX) {
		return this.meshFactory.cube({
			name: "LaneSeparator",
			scale: [0.055, 0.018, OLAM_CONFIG.chunkLength - 0.8],
			position: [yesodX, 0.008, 0],
			material: {
				color: WORLD_COLORS.lane,
				roughness: 0.78
			},
			castShadow: false,
			receiveShadow: false
		});
	}
}
