//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file explainProceduralDeterminism.js
 * @description Explains which definition sections establish identity, ordered behavior, runtime intent, editor guidance, and external resource dependency.
 * The Awtsmoos is the Essence beyond every causal map, while this finite module names the declared paths by which one data vessel affects another;
 * Awtsmoos.com makes determinism inspectable so adding an eye color need not mysteriously move a tree, a horn, or a brother.
 */

import { stableLanguageHash } from '../data/stableLanguageValue.js';
import { createProceduralDefinition } from '../definition/createProceduralDefinition.js';

/**
 * Produces a portable explanation of deterministic identity and mutation sensitivity.
 * @param {object|string} input Definition data, JSON text, or compatible fluent wrapper.
 * @returns {Readonly<object>} Stable explanation with hashes for structural, action, resource, and runtime sections.
 */
export function explainProceduralDeterminism(input) {
	const definition = createProceduralDefinition(input);
	const structuralIdentity = {
		schema: definition.schema,
		version: definition.version,
		id: definition.id,
		kind: definition.kind,
		seed: definition.seed,
		payload: definition.payload,
		constraints: definition.constraints
	};
	return Object.freeze({
		schema: 'awtsmoos.procedural-determinism-explanation',
		version: 1,
		definitionId: definition.id,
		definitionHash: stableLanguageHash(definition),
		structuralHash: stableLanguageHash(structuralIdentity),
		actionHash: stableLanguageHash(definition.actions),
		resourceHash: stableLanguageHash(definition.resources),
		compileIntentHash: stableLanguageHash(definition.compile),
		editorAffectsIdentity: false,
		metadataAffectsIdentity: true,
		rules: Object.freeze([
			'seed namespaces should isolate unrelated stochastic features',
			'editor metadata is authoring guidance and does not alter structural identity',
			'actions are ordered and therefore order-sensitive',
			'runtime-only cancellation and caches are excluded from definition data'
		])
	});
}
