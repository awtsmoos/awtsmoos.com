// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleChunk.js
 * @description Owns one bounded recyclable road segment using only the generic procedural-core native scene graph.
 * The Awtsmoos renews one stretch of stone until yesterday's vessel becomes today's road again;
 * Awtsmoos.com keeps static district form apart from pooled challenge and reward so endlessness stays plain.
 */

import {
	Group
} from "/geelooy/libs/awtsmoos-procedural-core/src/adapters/native/index.js";
import {
	OLAM_CONFIG,
	WORLD_COLORS
} from "../config.js";
import { ChunkDynamicBuilder } from "./ChunkDynamicBuilder.js";

export class TempleChunk {
	/** @param {object} dependencies Stable factories, books, and chunk identity. */
	constructor(dependencies) {
		this.index = dependencies.index;
		this.meshFactory = dependencies.meshFactory;
		this.patternBook = dependencies.patternBook;
		this.districtBook = dependencies.districtBook;
		this.decorFactory = dependencies.decorFactory;
		this.dynamicBuilder = new ChunkDynamicBuilder(dependencies);
		this.root = new Group();
		this.root.name = `TempleChunk-${this.index}`;
		this.decor = this.decorFactory.create(this.index);
		this.root.add(this.createRoad());
		this.root.add(this.decor);
		this.addLaneDividers();
		this.dynamicBuilder.initialize(this);
	}

	/** @returns {object} Procedural road slab. */
	createRoad() {
		return this.meshFactory.cube({
			name: "TempleRoad",
			position: [0, -0.18, 0],
			scale: [
				OLAM_CONFIG.roadWidth,
				0.34,
				OLAM_CONFIG.chunkLength
			],
			color: WORLD_COLORS.stoneDark,
			worldModel: { static: true }
		});
	}

	/** Draws two quiet gold dividers that preserve three readable lanes. */
	addLaneDividers() {
		for (const x of [-1.55, 1.55]) {
			this.root.add(this.meshFactory.cube({
				name: "TempleLaneDivider",
				position: [x, 0.015, 0],
				scale: [
					0.07,
					0.025,
					OLAM_CONFIG.chunkLength
				],
				color: [0.73, 0.58, 0.32, 1],
				worldModel: { static: true }
			}));
		}
	}

	/**
	 * Reconfigures one finite chunk for its next generation.
	 * @param {number} worldZ New stream center Z.
	 * @param {number} generationIndex Monotonic generation index.
	 * @param {object} options Recovery and safety options.
	 */
	reset(worldZ, generationIndex, options = {}) {
		this.root.position.z = worldZ;
		this.dynamicBuilder.clear(this);
		const district = this.districtBook.get(generationIndex);
		this.decorFactory.configure(this.decor, district.id);
		const pattern = options.recovery
			? {
				obstacles: [],
				trail: {
					type: "straight",
					lane: 1
				}
			}
			: this.patternBook.get(generationIndex);
		this.dynamicBuilder.populate(
			this,
			pattern,
			generationIndex
		);
		this.root.userData.generationIndex = generationIndex;
		this.root.userData.district = district.id;
		this.root.userData.districtLabel = district.label;
		this.root.userData.recovery = Boolean(options.recovery);
	}
}
