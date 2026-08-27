// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews one stable tree and clothes it for every public output.
 * This Awtsmoos.com facade preserves legacy buffers, presets, and helper APIs
 * while preventing mesh and LOD calls from owning separate growth algorithms.
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

function generationOptions(input) {
	return typeof input === "string" ? { detail: input } : input || {};
}

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
		this.lastSkeleton = null;
	}

	setConfig(config) {
		this.config = resolveTreeConfig(config);
		this.lastOutput = null;
		this.lastSkeleton = null;
		return this;
	}

	generate(input = {}) {
		const options = generationOptions(input);
		this.rng = new TreeRNG(this.config.seed);
		this.builder = new TreeGeometryBuilder();
		this.system = new TreeGrowthSystem(
			this.config,
			this.rng,
			this.builder,
			options.detail || options.quality || "high",
			{ budget: options.budget || {} }
		);
		this.system.generate();
		this.lastSkeleton = this.system.skeleton;
		this.lastOutput = createTreeOutput(
			this.config,
			this.builder,
			this.system,
			this.system.detail
		);
		return this.lastOutput;
	}

	build(input = {}) {
		return this.generate(input);
	}

	createGeometry(input = {}) {
		return this.generate(input);
	}

	generateSkeleton() {
		this.lastSkeleton = new TreeSkeletonGenerator(this.config).generate();
		return this.lastSkeleton;
	}

	generateLODs(input = {}) {
		const options = Array.isArray(input) ? { profiles: input } : input || {};
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

export const generateTreeLODs = generateTreeLods;

export {
	TREE_PRESETS,
	getTreeCapabilities,
	getTreePreset,
	listTreePresets,
	resolveTreeConfig
};
export default TreeGenerator;
