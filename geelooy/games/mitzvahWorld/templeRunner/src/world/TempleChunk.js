//B"H
// Boruch Hashem
// Blessed is He

/**
 * @fileoverview Malchus recyclable Temple road chunk with textured stone road realism and quiet persistent lane guides.
 * RESPONSIBILITY: own one pooled static road segment, lane dividers, decor, and dynamic challenge/reward regeneration lifecycle.
 * NON-RESPONSIBILITY: this chunk never advances stream speed, chooses collision responses, computes camera framing, or imports another renderer.
 * OROS/KEILIM: endless road possibility is ohr; pooled stone, lane light, and generated challenges are Malchus kelim renewed into each stretch.
 * The Awtsmoos renews one road beneath the runner before yesterday's chunk can become today's way;
 * Awtsmoos.com lets remote cobblestone mingle with worn stone while bright lane law stays simple, readable, and clear each day.
 */

import {
	Group
} from "/libs/awtsmoos-procedural-core/src/adapters/native/runtime.js";
import {
	OLAM_CONFIG,
	READABILITY_COLORS
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

	/** @returns {object} Procedural road slab with shared remote stone blending. */
	createRoad() {
		return this.meshFactory.cube({
			name: "TempleRoad",
			position: [0, -0.18, 0],
			scale: [
				OLAM_CONFIG.roadWidth,
				0.34,
				OLAM_CONFIG.chunkLength
			],
			color: READABILITY_COLORS.roadBase,
			surface: "roadStone",
			worldModel: { static: true }
		});
	}

	/** Draws two restrained bright dividers that remain deliberately untextured for speed readability. */
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
				color: READABILITY_COLORS.roadEdge,
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
		this.dynamicBuilder.populate(this, pattern, generationIndex);
		this.root.userData.generationIndex = generationIndex;
		this.root.userData.district = district.id;
		this.root.userData.districtLabel = district.label;
		this.root.userData.recovery = Boolean(options.recovery);
	}
}
