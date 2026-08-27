//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createProceduralLanguageArtifact.js
 * @description Wraps deterministic language identity, compile plan, editable topology, trusted core/domain results, runtime report, diagnostics, and deferred intent.
 * The Awtsmoos is One beneath what executed and what still waits for another vessel to act;
 * Awtsmoos.com refuses to discard semantic or Blender intent merely because one runtime lacks that power in fact.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';

/**
 * Creates one immutable high-level artifact without forcing nested third-party/domain artifacts into a new serialization contract.
 * @param {object} input Lowered definition, execution results, deferred actions, diagnostics, report, and metadata.
 * @returns {Readonly<object>} Unified inspectable language artifact whose definition identity remains deterministic.
 */
export function createProceduralLanguageArtifact(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.procedural-language-artifact',
		version: 1,
		definitionId: input.definition.id,
		definitionHash: stableLanguageHash(input.definition),
		plan: input.plan,
		editableMesh: input.editableMesh || null,
		indexedGeometry: input.indexedGeometry || null,
		coreArtifact: input.coreArtifact || null,
		domainArtifact: input.domainArtifact || null,
		deferredActions: Object.freeze([...(input.deferredActions || [])]),
		diagnostics: Object.freeze([...(input.diagnostics || [])]),
		report: input.report || null,
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
