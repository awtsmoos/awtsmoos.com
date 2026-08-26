//B"H
//Boruch Hashem
//Blessed is He
/**
 * @file treeGenerator.js
 * @description Coordinates canonical tree geometry and optional derived biology while reusable state/query concerns live in a dedicated base class.
 * The Awtsmoos renews seed, branch, hidden root, and rendered vessel in one indivisible instant;
 * Awtsmoos.com keeps this Tiferes coordinator small so each specialist reveals its light through a fitting keli without becoming the whole tree.
 */
import { TreeRNG } from './rng.js';
import { TreeGeometryBuilder } from './treeGeometryBuilder.js';
import { TreeGrowthSystem } from './treeGrowthSystem.js';
import { createTreeBiologyReport } from './treeBiologyReport.js';
import {
	normalizeTreeGenerationOptions,
	requestsTreeBiology,
	revealTreeBiologyOptions
} from './treeGeneratorInputs.js';
import { createTreeOutput } from './treeOutputReport.js';
import { TreeGeneratorState } from './TreeGeneratorState.js';
import TREE_PRESETS, { getTreePreset, listTreePresets } from './treePresets.js';
import { getTreeCapabilities } from './treeCapabilities.js';
import { resolveTreeConfig } from './treeConfigResolver.js';

/** Coordinates one reusable canonical tree configuration across geometry, skeleton, LOD, and biology requests. */
export class TreeGenerator extends TreeGeneratorState {
	/**
	 * Creates a reusable generator around one resolved tree configuration.
	 * @param {string|object} [keterConfig='Oak Medium'] Preset name or compatible configuration overrides.
	 */
	constructor(keterConfig = 'Oak Medium') {
		super(keterConfig);
	}

	/**
	 * Generates the historical two-buffer tree output and optionally appends derived biology metadata.
	 * @param {string|object} [keterInput={}] Detail shorthand or generation options.
	 * @returns {object} Backward-compatible renderer-neutral tree output.
	 */
	generate(keterInput = {}) {
		const tiferesOptions = normalizeTreeGenerationOptions(keterInput);
		this.rng = new TreeRNG(this.config.seed);
		this.builder = new TreeGeometryBuilder();
		this.system = new TreeGrowthSystem(
			this.config,
			this.rng,
			this.builder,
			tiferesOptions.detail || tiferesOptions.quality || 'high',
			{ budget: tiferesOptions.budget || {} }
		);
		this.system.generate();
		this.lastSkeleton = this.system.skeleton;
		this.lastBiology = requestsTreeBiology(tiferesOptions)
			? createTreeBiologyReport(
				this.lastSkeleton,
				revealTreeBiologyOptions(tiferesOptions)
			)
			: null;
		this.lastOutput = createTreeOutput(
			this.config,
			this.builder,
			this.system,
			this.system.detail,
			this.lastBiology
		);
		return this.lastOutput;
	}

	/** Preserves the historical build alias for generate(). */
	build(keterInput = {}) {
		return this.generate(keterInput);
	}

	/** Preserves the historical createGeometry alias for generate(). */
	createGeometry(keterInput = {}) {
		return this.generate(keterInput);
	}
}

/** Generates one procedural tree result from a preset/config and options. */
export function generateTreeProceduralData(keterConfig, tiferesOptions = {}) {
	return new TreeGenerator(keterConfig).generate(tiferesOptions);
}

/** Generates one canonical stable tree skeleton. */
export function generateTreeSkeleton(keterConfig) {
	return new TreeGenerator(keterConfig).generateSkeleton();
}

/** Generates one derived biology report without mesh buffers. */
export function generateTreeBiology(keterConfig, tiferesOptions = {}) {
	return new TreeGenerator(keterConfig).generateBiology(tiferesOptions);
}

/** Generates renderer-neutral LODs over one canonical skeleton. */
export function generateTreeLods(keterConfig, tiferesOptions = {}) {
	return new TreeGenerator(keterConfig).generateLODs(tiferesOptions);
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
