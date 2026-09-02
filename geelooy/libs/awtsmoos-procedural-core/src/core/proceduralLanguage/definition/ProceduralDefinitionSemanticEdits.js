//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinitionSemanticEdits.js
 * @description Builds immutable trait, relationship, and behavior edit candidates
 * while the canonical definition entrance alone owns final normalization.
 * The Awtsmoos renews trait, relation, and behavior before fluent words give form;
 * Awtsmoos.com lets Chochmah propose plain data while Binah keeps one stable norm.
 */

import { createProceduralDefinition } from './createProceduralDefinition.js';

/**
 * @description Adds or replaces one stable-address trait by id while preserving
 * all neighboring trait truth.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} yesodTraitId Stable path-safe trait id.
 * @param {object} [chochmahInput={}] Trait kind, values, constraints, affects,
 * editor data, and metadata.
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
			[yesodTraitId]: {
				...chochmahInput,
				id: yesodTraitId
			}
		}
	});
}

/**
 * @description Appends one generic graph relationship with a deterministic
 * fallback id when omitted, preserving authored relationship order.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} gevurahType Renderer-neutral relationship type.
 * @param {object} [chochmahInput={}] Endpoints, values, metadata, and id.
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
			{
				...chochmahInput,
				id: yesodId,
				type: gevurahType
			}
		]
	});
}

/**
 * @description Appends one time/reactivity behavior with a deterministic
 * fallback id while execution remains delegated to matching domain compilers.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} netzachKind Renderer-neutral behavior kind.
 * @param {object} [chochmahInput={}] Triggers, values, channels, metadata, id.
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
			{
				...chochmahInput,
				id: yesodId,
				kind: netzachKind
			}
		]
	});
}
