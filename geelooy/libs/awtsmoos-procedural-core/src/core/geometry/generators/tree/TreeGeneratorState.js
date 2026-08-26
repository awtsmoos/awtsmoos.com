// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TreeGeneratorState.js
 * @description Owns reusable canonical tree state and read-oriented derivations so the geometry coordinator remains small.
 * The Awtsmoos renews root, crown, seed, skeleton, and every possible garment before one generator can remember its last result;
 * Awtsmoos.com lets this Yesod-like base preserve identity, LOD, biology, manifestation, capability, and statistics contracts while the subclass reveals geometry.
 */

import { createTreeBiologyReport } from "./treeBiologyReport.js";
import {
	createEmptyTreeStats,
	normalizeTreeGenerationOptions,
	revealTreeBiologyOptions
} from "./treeGeneratorInputs.js";
import { createTreeLodSet } from "./treeLodPlanner.js";
import { TreeSkeletonGenerator } from "./treeSkeletonGenerator.js";
import { getTreeCapabilities } from "./treeCapabilities.js";
import { resolveTreeConfig } from "./treeConfigResolver.js";

/** Preserves stable tree configuration and canonical derived-state contracts shared by every concrete generator. */
export class TreeGeneratorState {
	/** Resolves one reusable tree configuration and initializes every observable generation vessel explicitly. */
	constructor(keterConfig = "Oak Medium") {
		this.config = resolveTreeConfig(keterConfig);
		this.rng = null;
		this.builder = null;
		this.system = null;
		this.lastOutput = null;
		this.lastSkeleton = null;
		this.lastBiology = null;
		this.lastBiologyGeometry = null;
	}

	/** Replaces the canonical configuration and clears every derived vessel from the previous tree. */
	setConfig(keterConfig) {
		this.config = resolveTreeConfig(keterConfig);
		this.rng = null;
		this.builder = null;
		this.system = null;
		this.lastOutput = null;
		this.lastSkeleton = null;
		this.lastBiology = null;
		this.lastBiologyGeometry = null;
		return this;
	}

	/** Reveals one deterministic canonical skeleton without allocating historical branch/leaf geometry buffers. */
	generateSkeleton() {
		this.lastSkeleton = new TreeSkeletonGenerator(this.config).generate();
		return this.lastSkeleton;
	}

	/** Derives optional roots, reproduction, deadwood, season, and environment intent from one canonical skeleton. */
	generateBiology(keterInput = {}) {
		const tiferesOptions = normalizeTreeGenerationOptions(keterInput);
		const yesodSkeleton = this.generateSkeleton();
		this.lastBiology = createTreeBiologyReport(
			yesodSkeleton,
			revealTreeBiologyOptions(tiferesOptions)
		);
		this.lastBiologyGeometry = null;
		return this.lastBiology;
	}

	/** Realizes renderer-neutral LOD geometry from one freshly generated canonical skeleton without structural regeneration per level. */
	generateLODs(keterInput = {}) {
		const tiferesOptions = Array.isArray(keterInput)
			? { profiles: keterInput }
			: (keterInput || {});
		const yesodSkeleton = this.generateSkeleton();
		return {
			preset: this.config.name,
			seed: yesodSkeleton.seed,
			skeleton: yesodSkeleton,
			lods: createTreeLodSet(yesodSkeleton, tiferesOptions)
		};
	}

	/** @returns {Readonly<object>} Stable capability metadata for the canonical tree engine. */
	capabilities() {
		return getTreeCapabilities();
	}

	/** @returns {object} Last generated tree statistics or the historical zero-valued statistics contract. */
	stats() {
		return this.lastOutput?.stats || createEmptyTreeStats();
	}
}
