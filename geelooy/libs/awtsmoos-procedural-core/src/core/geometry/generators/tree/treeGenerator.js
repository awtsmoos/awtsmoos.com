// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos recreates the tree at every invocation, never accumulating an
 * old vessel into a new one. This Awtsmoos.com public facade preserves the
 * legacy two-draw-call result while exposing raw geometry and coherent LODs.
 */
import { TreeRNG } from "./rng.js";
import { TreeGeometryBuilder } from "./treeGeometryBuilder.js";
import { TreeGrowthSystem } from "./treeGrowthSystem.js";
import { createTreeOutput } from "./treeOutputReport.js";
import { resolveTreeConfig } from "./treeConfigResolver.js";
import {
	DEFAULT_TREE_LOD_ORDER,
	normalizeTreeDetailProfile
} from "./treeDetailProfiles.js";
import TREE_PRESETS, { getTreePreset, listTreePresets } from "./treePresets.js";

export class TreeGenerator {
	constructor(config = "Oak Medium") {
		this.config = resolveTreeConfig(config);
		this.lastResult = null;
	}

	setConfig(config) {
		this.config = resolveTreeConfig(config);
		this.lastResult = null;
		return this;
	}

	build(detail = "high") {
		const profile = normalizeTreeDetailProfile(detail);
		const builder = new TreeGeometryBuilder();
		const rng = new TreeRNG(this.config.seed);
		const system = new TreeGrowthSystem(this.config, rng, builder, profile);
		system.generate();
		this.lastResult = createTreeOutput(this.config, builder, system, profile);
		return this.lastResult;
	}

	generate(detail = "high") {
		return this.build(detail);
	}

	createGeometry(detail = "high") {
		return this.build(detail);
	}

	generateLODs(details = DEFAULT_TREE_LOD_ORDER) {
		if (!Array.isArray(details) || details.length === 0) {
			throw new TypeError('B"H | Tree LOD details must be a non-empty array.');
		}
		return details.map((detail, index) => {
			const profile = normalizeTreeDetailProfile(detail);
			return {
				...this.build(profile),
				lod: {
					index,
					profile: profile.name,
					distance: profile.distance,
					hysteresis: profile.hysteresis
				}
			};
		});
	}

	stats() {
		return this.lastResult?.stats || this.build().stats;
	}
}

export function generateTreeProceduralData(config, detail = "high") {
	return new TreeGenerator(config).generate(detail);
}

export { TREE_PRESETS, getTreePreset, listTreePresets };
export default TreeGenerator;
