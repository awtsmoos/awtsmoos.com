//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TempleChunk.js
 * @description Owns one recyclable Jerusalem road chunk whose slab carries the native Core road ecology channel while bright lane guides remain deliberately plain for gameplay readability.
 * The Awtsmoos renews one road beneath the runner before yesterday's pooled chunk can become today's way;
 * Awtsmoos.com lets cached cobble, worn stone, and road-earth answer one semantic zone while bright lane law stays simple through the day.
 */

import {
	Group
} from "../../../../../libs/awtsmoos-procedural-core/src/adapters/native/runtime.js?compact=true";
import {
	OLAM_CONFIG,
	READABILITY_COLORS
} from "../config.js";
import { TEMPLE_ECOLOGY_ZONES } from "../realism/TempleEcologyZones.js";
import { ChunkDynamicBuilder } from "./ChunkDynamicBuilder.js";

export class TempleChunk {
	/**
	 * Creates one pooled static road vessel plus dynamic challenge/reward ownership.
	 * @param {object} dependencies Stable factories, books, and chunk identity.
	 */
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

	/**
	 * Reveals the procedural road slab with shared remote texture hydration and explicit road ecology affinity.
	 * @returns {object} Native procedural road slab.
	 */
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
			zone: TEMPLE_ECOLOGY_ZONES.road,
			worldModel: { static: true }
		});
	}

	/**
	 * Draws restrained bright lane dividers without remote texture or ecology layers so steering information remains visually invariant.
	 * @returns {void}
	 */
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
	 * Reconfigures one finite chunk for its next streamed generation while preserving the static road vessel.
	 * @param {number} worldZ New stream center Z.
	 * @param {number} generationIndex Monotonic generation index.
	 * @param {object} options Recovery and safety options.
	 * @returns {void}
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
