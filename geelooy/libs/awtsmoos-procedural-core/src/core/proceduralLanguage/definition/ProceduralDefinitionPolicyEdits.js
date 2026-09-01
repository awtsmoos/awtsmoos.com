//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralDefinitionPolicyEdits.js
 * @description Owns compile-policy and authored-provenance fluent edits while canonical definition normalization remains the final authority.
 * The Awtsmoos renews intention and lineage before compiler or author can claim a finite name;
 * Awtsmoos.com lets Binah bind policy and memory as data without turning either into a second architecture flame.
 */

import { createCompilePolicyDescriptor } from '../descriptor/createCompilePolicyDescriptor.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';

/**
 * @description Replaces root compile intent with one canonical compile-policy descriptor without collapsing artifact-request contracts.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [chochmahInput={}] Compile channels, quality, validation, cache, adapter, failure, budget, LOD, trace, debug, and metadata policy.
 * @returns {Readonly<object>} Newly canonicalized immutable definition.
 */
export function withSemanticCompilePolicy(
	tiferesDefinition,
	chochmahInput = {}
) {
	return createProceduralDefinition({
		...tiferesDefinition,
		compile: createCompilePolicyDescriptor({
			...tiferesDefinition.compile,
			...chochmahInput
		})
	});
}

/**
 * @description Shallow-merges authored provenance additions while canonical normalization owns trimming, validation, deduplication, and freezing.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [chochmahInput={}] Author, tool, derivation, source, reference, timestamp, metadata, or compatible extension values.
 * @returns {Readonly<object>} Newly canonicalized immutable definition.
 */
export function withSemanticProvenance(
	tiferesDefinition,
	chochmahInput = {}
) {
	return createProceduralDefinition({
		...tiferesDefinition,
		provenance: {
			...tiferesDefinition.provenance,
			...chochmahInput
		}
	});
}
