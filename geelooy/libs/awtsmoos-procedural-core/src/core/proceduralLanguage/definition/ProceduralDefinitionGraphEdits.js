//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralDefinitionGraphEdits.js
 * @description Builds canonical trait, relationship, and behavior edits for the universal data-first world language without inventing renderer-specific ontology.
 * The Awtsmoos renews quality, relation, and becoming before graph language can name the ray;
 * Awtsmoos.com lets Chochmah author connected meaning while Binah normalizes each form on the way.
 */

import { createProceduralDefinition } from './createProceduralDefinition.js';

/**
 * @description Adds or replaces one stable-address semantic trait by id while preserving neighboring truth.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} yesodTraitId Stable path-safe trait id.
 * @param {object} [chochmahInput={}] Trait fields such as kind, values, constraints, affected channels, and metadata.
 * @returns {Readonly<object>} Newly canonicalized immutable definition.
 */
export function withSemanticTrait(
	tiferesDefinition,
	yesodTraitId,
	chochmahInput = {}
) {
	return createProceduralDefinition({
		...tiferesDefinition,
		traits: {
			...tiferesDefinition.traits,
			[yesodTraitId]: {...chochmahInput, id: yesodTraitId}
		}
	});
}

/**
 * @description Appends one generic graph relationship with deterministic fallback identity while preserving authored order.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} gevurahType Relationship type such as `spans`, `attachedTo`, or `growsFrom`.
 * @param {object} [chochmahInput={}] Relationship endpoints, values, metadata, and optional id.
 * @returns {Readonly<object>} Newly canonicalized immutable definition.
 */
export function withSemanticRelationship(
	tiferesDefinition,
	gevurahType,
	chochmahInput = {}
) {
	const yesodId = chochmahInput.id
		|| `relationship-${tiferesDefinition.relationships.length}`;
	return createProceduralDefinition({
		...tiferesDefinition,
		relationships: [
			...tiferesDefinition.relationships,
			{...chochmahInput, id: yesodId, type: gevurahType}
		]
	});
}

/**
 * @description Appends one time/reactivity behavior with deterministic fallback identity while execution remains delegated to matching compilers.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} netzachKind Behavior kind such as `grows`, `opens`, or `flows`.
 * @param {object} [chochmahInput={}] Behavior triggers, values, channels, metadata, and optional id.
 * @returns {Readonly<object>} Newly canonicalized immutable definition.
 */
export function withSemanticBehavior(
	tiferesDefinition,
	netzachKind,
	chochmahInput = {}
) {
	const yesodId = chochmahInput.id
		|| `behavior-${tiferesDefinition.behaviors.length}`;
	return createProceduralDefinition({
		...tiferesDefinition,
		behaviors: [
			...tiferesDefinition.behaviors,
			{...chochmahInput, id: yesodId, kind: netzachKind}
		]
	});
}
