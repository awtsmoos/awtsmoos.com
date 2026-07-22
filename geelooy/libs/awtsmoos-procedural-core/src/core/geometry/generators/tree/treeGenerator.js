// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews the entire tree on every invocation, so no old buffer
 * masquerades as new growth. This Awtsmoos.com façade preserves the original
 * mesh contract while also exposing stable structural artifacts and LODs.
 */

import { TreeRNG } from "./rng.js";
import { TreeGeometryBuilder } from "./treeGeometryBuilder.js";
import { TreeGrowthSystem } from "./treeGrowthSystem.js";
import { TreeSkeletonGenerator } from "./treeSkeletonGenerator.js";
import { createTreeLodSet } from "./treeLodPlanner.js";
import { getTreeCapabilities } from "./treeCapabilities.js";
import { createTreeOutput } from "./treeOutputReport.js";
import { resolveTreeConfig } from "./treeConfigResolver.js";
import TREE_PRESETS, { getTreePreset, listTreePresets } from "./treePresets.js";

function emptyTreeStats() {
	return {
		branchVertices: 0,
		leafVertices: 0,
		branchTriangles: 0,
		leafTriangles: 0,
		generatedBranches: 0,
		drawCalls: 2
	};
}

export class TreeGenerator {
	constructor(config = "Oak Medium") {
		this.config = resolveTreeConfig(config);
		this.rng = null;
		this.builder = null;
		this.system = null;
		this.lastOutput = null;
	}

	generate(options = {}) {
		this.rng = new TreeRNG(this.config.seed);
		this.builder = new TreeGeometryBuilder();
		this.system = new TreeGrowthSystem(
			this.config,
			this.rng,
			this.builder,
			options.detail || options.quality || {}
		);
		this.system.generate();
		this.lastOutput = createTreeOutput(
			this.config,
			this.builder,
			this.system,
			this.system.detail
		);
		return this.lastOutput;
	}

	generateSkeleton() {
		return new TreeSkeletonGenerator(this.config).generate();
	}

	generateLODs(options = {}) {
		const skeleton = this.generateSkeleton();
		return {
			preset: this.config.name,
			seed: skeleton.seed,
			skeleton,
			lods: createTreeLodSet(skeleton, options)
		};
	}

	capabilities() {
		return getTreeCapabilities();
	}

	stats() {
		return this.lastOutput?.stats || emptyTreeStats();
	}
}

export function generateTreeProceduralData(config, options = {}) {
	return new TreeGenerator(config).generate(options);
}

export function generateTreeSkeleton(config) {
	return new TreeGenerator(config).generateSkeleton();
}

export function generateTreeLods(config, options = {}) {
	return new TreeGenerator(config).generateLODs(options);
}

export {
	TREE_PRESETS,
	getTreeCapabilities,
	getTreePreset,
	listTreePresets,
	resolveTreeConfig
};
export default TreeGenerator;
