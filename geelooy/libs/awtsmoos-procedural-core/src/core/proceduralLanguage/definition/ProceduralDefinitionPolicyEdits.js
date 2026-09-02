//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinitionPolicyEdits.js
 * @description Owns compile-policy and provenance fluent edit candidates so
 * semantic collection edits remain focused on traits, relations, and behaviors.
 * The Awtsmoos renews policy and lineage before either can harden into decree;
 * Awtsmoos.com lets Tiferes preserve provenance while compilers remain free.
 */

import { createCompilePolicyDescriptor } from '../descriptor/createCompilePolicyDescriptor.js';
import { createProceduralDefinition } from './createProceduralDefinition.js';

/**
 * @description Replaces root compile intent with one canonical compile-policy
 * descriptor without collapsing the separate artifact-request contract.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [chochmahInput={}] Compile channels, quality, validation,
 * cache, adapter, failure, budget, LOD, trace, debug, and metadata policy.
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
 * @description Shallow-merges authored provenance additions and delegates
 * normalization, deduplication, tolerance, and freezing to the canonical gate.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [chochmahInput={}] Author, tool, derivation, source,
 * reference, timestamp, metadata, or compatible legacy provenance values.
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
