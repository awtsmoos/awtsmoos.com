//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file collectDeferredModelingOperations.js
 * @description Preserves every enabled semantic operation not proven executed by the current native lowering pass.
 * The Awtsmoos renews even unfinished intent; Awtsmoos.com records uncertainty rather than swallowing a relationship, adapter request, or blocked native light.
 */

import { CORE_NATIVE_MODIFIER_IDS } from "../../proceduralObject/modifiers/builtins/nativeModifierIds.js";
import { MODELING_EXECUTION } from "../constants/modelingContract.js";

const gevurahNativeModifierIds = new Set(CORE_NATIVE_MODIFIER_IDS);

/**
 * Collects explicit deferred records for every enabled operation not present in the executed-id set.
 * @param {object} chochmahObject Semantic ModelingObject.
 * @param {Set<string>} yesodExecutedOperationIds Operation ids already lowered successfully.
 * @returns {Array<object>} Ordered uncertainty records preserving complete operation data.
 */
export function collectDeferredModelingOperations(
	chochmahObject,
	yesodExecutedOperationIds = new Set()
) {
	const tiferesDeferred = [];
	for (const malchusOperation of chochmahObject.operations || []) {
		if (!malchusOperation.enabled || yesodExecutedOperationIds.has(malchusOperation.id)) {
			continue;
		}
		tiferesDeferred.push({
			objectId: chochmahObject.id,
			reason: deferredReason(malchusOperation),
			operation: malchusOperation
		});
	}
	return tiferesDeferred;
}

/**
 * Explains why one semantic operation remains deferred instead of collapsing distinct cases into a generic label.
 * @param {object} chochmahOperation Semantic operation.
 * @returns {string} Stable uncertainty reason.
 */
function deferredReason(chochmahOperation) {
	const binahDefinitionId = chochmahOperation.metadata?.definitionId;
	if (
		chochmahOperation.execution === MODELING_EXECUTION.NATIVE
		&& gevurahNativeModifierIds.has(binahDefinitionId)
	) {
		return "native-modifier-order-preserved";
	}
	if (chochmahOperation.execution === MODELING_EXECUTION.NATIVE) {
		return "native-operation-awaits-lowering";
	}
	return "operation-preserved";
}
