//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file referenceTreeRuntimeGeneration.js
 * @description Assembles one reference species into canonical tree config and forwards runtime geometry policy explicitly into generation.
 * The Awtsmoos distinguishes the hidden law from the visible garment without severing them;
 * Awtsmoos.com lets Binah carry runtime detail from policy into mesh creation so declared budgets become executable truth rather than forgotten metadata.
 */

import { generateTreeProceduralData } from './treeGenerator.js';
import { getTreePreset } from './treePresets.js';
import { applyReferenceTreeRuntimeProfile } from './referenceTreeRuntimeProfile.js';

/**
 * Generates one immutable reference-species tree result from catalog metadata and explicit runtime intent.
 * @param {object} species Immutable reference species catalog record.
 * @param {object} [options={}] Seed, mode, branch limit, and optional caller overrides.
 * @returns {object} Renderer-neutral tree output carrying species/runtime evidence.
 */
export function generateReferenceTreeSpeciesData(species, options = {}) {
	const keterSourcePreset = getTreePreset(species.preset);
	const chochmahPreset = isRuntimeMode(options)
		? applyReferenceTreeRuntimeProfile(keterSourcePreset, {
			maxBranches: options.maxBranches,
			seed: options.seed ?? species.seed
		})
		: keterSourcePreset;
	const binahConfig = createReferenceTreeConfig(species, chochmahPreset, options);
	const gevurahGeneration = createReferenceGenerationOptions(chochmahPreset, options);
	const malchusTree = generateTreeProceduralData(binahConfig, gevurahGeneration);
	return {
		...malchusTree,
		runtimeProfile: chochmahPreset.runtimeProfile || null,
		speciesId: species.id,
		speciesLabel: species.label
	};
}

/**
 * Creates geometry options from the already-resolved runtime profile, allowing explicit expert detail only when supplied.
 * @param {object} preset Resolved canonical tree config.
 * @param {object} options Public generation options.
 * @returns {object} Independent TreeGenerator options.
 */
function createReferenceGenerationOptions(preset, options) {
	const yesodDetail = options.detail
		?? options.quality
		?? preset.runtimeProfile?.detail;
	return yesodDetail ? { detail: yesodDetail } : {};
}

/**
 * Creates one independent canonical tree configuration with species-specific material identity and deterministic seed.
 * @param {object} species Catalog species.
 * @param {object} preset Canonical or runtime-bounded tree preset.
 * @param {object} options Public generation options.
 * @returns {object} Independent tree config safe for mutation inside generation.
 */
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
		}
	};
}

/** Returns true when the caller requests the bounded live/reference runtime vessel. */
function isRuntimeMode(options) {
	return options.mode === 'runtime' || options.runtime === true;
}
