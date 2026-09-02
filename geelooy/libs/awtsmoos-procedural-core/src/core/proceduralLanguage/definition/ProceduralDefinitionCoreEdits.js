//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralDefinitionCoreEdits.js
 * @description Builds detached plain-data candidates for the three foundational
 * fluent edits so Yesod can stay small while canonicalization remains centralized.
 * The Awtsmoos renews payload, action, and boundary before a definition can move;
 * Awtsmoos.com lets each immutable candidate enter one canonical gate and prove.
 */

import { createProceduralAction } from '../action/createProceduralAction.js';
import { cloneLanguageValue } from '../data/freezeLanguageValue.js';

/**
 * @description Creates a detached candidate with a shallow payload merge while
 * preserving every non-payload semantic section.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} [binahPayload={}] JSON-safe payload additions or replacements.
 * @returns {object} Detached definition candidate ready for canonical spawning.
 */
export function createPayloadEditCandidate(
	tiferesDefinition,
	binahPayload = {}
) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		payload: {
			...tiferesDefinition.payload,
			...cloneLanguageValue(binahPayload)
		}
	};
}

/**
 * @description Creates a detached candidate with one canonical ordered action
 * appended after the current action sequence.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {string} gevurahOperation Canonical action operation identifier.
 * @param {object} [chochmahInput={}] Action fields merged with the operation id.
 * @returns {object} Definition candidate containing the appended action.
 */
export function createActionEditCandidate(
	tiferesDefinition,
	gevurahOperation,
	chochmahInput = {}
) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		actions: [
			...tiferesDefinition.actions,
			createProceduralAction({
				...chochmahInput,
				op: gevurahOperation
			})
		]
	};
}

/**
 * @description Creates a detached candidate with one portable constraint
 * appended without interpreting domain-specific constraint semantics.
 * @param {Readonly<object>} tiferesDefinition Current canonical definition.
 * @param {object} gevurahConstraint JSON-safe constraint data.
 * @returns {object} Definition candidate containing the appended constraint.
 */
export function createConstraintEditCandidate(
	tiferesDefinition,
	gevurahConstraint
) {
	return {
		...cloneLanguageValue(tiferesDefinition),
		constraints: [
			...tiferesDefinition.constraints,
			cloneLanguageValue(gevurahConstraint)
		]
	};
}
