//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeRuntimeGeneration.js
 * @description Translates public reference-tree runtime intent into canonical structural, material, and renderer-neutral generation policy.
 * RESPONSIBILITY: recognize runtime aliases, apply the bounded reference profile, preserve species material provenance, and forward valid mesh detail.
 * NON-RESPONSIBILITY: this boundary does not loosen low-level validators, duplicate runtime-profile policy, or invent species geometry.
 * The Awtsmoos lets one caller say runtime while the inner tree hears balanced measure and one material lineage in its proper place;
 * Awtsmoos.com keeps public language broad, geometry language strict, and bark-to-leaf provenance visible on every professional face.
 */

import { generateTreeProceduralData } from './treeGenerator.js';
import { getTreePreset } from './treePresets.js';
import { applyReferenceTreeRuntimeProfile } from './referenceTreeRuntimeProfile.js';

/**
 * Generates one immutable reference-species tree result from catalog metadata and explicit runtime intent.
 * @param {object} species Immutable reference species catalog record.
 * @param {object} [options={}] Seed, runtime aliases, branch limit, geometry detail, and optional caller overrides.
 * @returns {object} Renderer-neutral tree output carrying species, runtime, and material-lineage evidence.
 */
export function generateReferenceTreeSpeciesData(species, options = {}) {
	const keterSourcePreset = getTreePreset(species.preset);
	const chochmahRuntime = requestsReferenceRuntime(options);
	const binahPreset = chochmahRuntime
		? applyReferenceTreeRuntimeProfile(keterSourcePreset, {
			maxBranches: options.maxBranches,
			seed: options.seed ?? species.seed
		})
		: keterSourcePreset;
	const gevurahConfig = createReferenceTreeConfig(species, binahPreset, options);
	const hodGeneration = createReferenceGenerationOptions(binahPreset, options, chochmahRuntime);
	const malchusTree = generateTreeProceduralData(gevurahConfig, hodGeneration);
	return {
		...malchusTree,
		runtimeProfile: binahPreset.runtimeProfile || null,
		speciesId: species.id,
		speciesLabel: species.label
	};
}

/** Resolves public quality/mode vocabulary into the narrower canonical geometry-detail language. */
function createReferenceGenerationOptions(preset, options, runtimeRequested) {
	if (options.detail !== undefined && options.detail !== null) {
		return { detail: options.detail };
	}
	if (runtimeRequested) {
		return preset.runtimeProfile?.detail
			? { detail: preset.runtimeProfile.detail }
			: {};
	}
	if (options.quality !== undefined && options.quality !== null) {
		return { detail: options.quality };
	}
	return {};
}

/** Creates one independent canonical tree configuration with coherent species-specific material provenance and deterministic seed. */
function createReferenceTreeConfig(species, preset, options) {
	return {
		...preset,
		seed: options.seed ?? species.seed,
		bark: {
			...preset.bark,
			family: species.barkFamily,
			textureUrl: species.barkUrl
		},
		leaves: {
			...preset.leaves,
			family: species.leafFamily,
			textureUrl: species.leafUrl,
			flowering: species.flowering
		},
		materials: {
			...preset.materials,
			barkFamily: species.barkFamily,
			barkUrl: species.barkUrl,
			leafFamily: species.leafFamily,
			leafUrl: species.leafUrl
		}
	};
}

/** Returns true when any supported public alias requests the bounded reference-runtime vessel. */
function requestsReferenceRuntime(options) {
	return options.mode === 'runtime'
		|| options.runtime === true
		|| options.quality === 'runtime';
}
