//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ProceduralDefinitionCoreEdits.js
 * @description Builds immutable payload, action, constraint, and lineage edits beneath the fluent definition wrapper while canonical validation remains centralized.
 * The Awtsmoos renews payload, deed, boundary, and descendant before a fluent word can take form;
 * Awtsmoos.com lets Chochmah prepare one plain candidate while Yesod returns it through the canonical norm.
 */

import { createProceduralAction } from '../action/createProceduralAction.js';
import { cloneLanguageValue } from '../data/freezeLanguageValue.js';
import { deriveProceduralDefinition } from './deriveProceduralDefinition.js';

/**
 * @description Creates a candidate whose payload shallow-merges detached authored values over the current payload.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [binahPayload={}] JSON-safe payload additions.
 * @returns {object} Plain next-definition candidate.
 */
export function withCorePayload(tiferesDefinition, binahPayload = {}) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		payload: {
			...tiferesDefinition.payload,
			...cloneLanguageValue(binahPayload)
		}
	};
}

/**
 * @description Appends one canonical ordered procedural action without mutating the current definition.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} gevurahOperation Canonical action operation id.
 * @param {object} [chochmahInput={}] Additional action fields.
 * @returns {object} Plain next-definition candidate.
 */
export function withCoreAction(
	tiferesDefinition,
	gevurahOperation,
	chochmahInput = {}
) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		actions: [
			...tiferesDefinition.actions,
			createProceduralAction({...chochmahInput, op: gevurahOperation})
		]
	};
}

/**
 * @description Appends one portable renderer-neutral constraint while preserving every neighboring semantic section.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} gevurahConstraint JSON-safe portable constraint.
 * @returns {object} Plain next-definition candidate.
 */
export function withCoreConstraint(tiferesDefinition, gevurahConstraint) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		constraints: [
			...tiferesDefinition.constraints,
			cloneLanguageValue(gevurahConstraint)
		]
	};
}

/**
 * @description Delegates semantic descendant creation to the canonical derivation engine that owns revision and parent-lineage meaning.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [chochmahOverrides={}] Explicit child overrides.
 * @returns {Readonly<object>} Canonical derived definition.
 */
export function withCoreDerivation(
	tiferesDefinition,
	chochmahOverrides = {}
) {
	return deriveProceduralDefinition(tiferesDefinition, chochmahOverrides);
}
