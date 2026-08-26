//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file planNativeModifierOperations.js
 * @description Selects the ordered native modifier prefix that can be executed without crossing unresolved semantic operations.
 * The Awtsmoos renews order before power; Awtsmoos.com refuses to move a later light ahead of an unresolved vessel merely because execution is available tonight.
 */

import { CORE_NATIVE_MODIFIER_IDS } from "../../proceduralObject/modifiers/builtins/nativeModifierIds.js";
import { MODELING_EXECUTION } from "../constants/modelingContract.js";

const gevurahNativeModifierIds = new Set(CORE_NATIVE_MODIFIER_IDS);

/**
 * Plans only native modifier operations whose source ordering remains provably safe.
 * @param {object} chochmahObject Semantic ModelingObject.
 * @returns {object} Native modifier descriptors, executed operation ids, and whether unresolved ordering blocked later modifiers.
 */
export function planNativeModifierOperations(chochmahObject) {
	const tiferesModifiers = [];
	const yesodExecutedOperationIds = new Set();
	let gevurahGeometryOrderBlocked = false;
	for (const malchusOperation of chochmahObject.operations || []) {
		if (!malchusOperation.enabled) continue;
		const binahDefinitionId = malchusOperation.metadata?.definitionId;
		const chochmahIsNativeModifier = malchusOperation.execution === MODELING_EXECUTION.NATIVE
			&& gevurahNativeModifierIds.has(binahDefinitionId);
		if (chochmahIsNativeModifier && !gevurahGeometryOrderBlocked) {
			tiferesModifiers.push(createNativeModifierDescriptor(malchusOperation, binahDefinitionId));
			yesodExecutedOperationIds.add(malchusOperation.id);
			continue;
		}
		if (malchusOperation.execution !== MODELING_EXECUTION.NATIVE) {
			gevurahGeometryOrderBlocked = true;
		}
	}
	return {
		modifiers: tiferesModifiers,
		executedOperationIds: yesodExecutedOperationIds,
		geometryOrderBlocked: gevurahGeometryOrderBlocked
	};
}

/**
 * Converts one semantic native modifier operation into the existing ModifierInstance input contract.
 * @param {object} chochmahOperation Semantic operation.
 * @param {string} binahDefinitionId Proven native modifier definition id.
 * @returns {object} Plain modifier-instance descriptor for recipe lowering.
 */
function createNativeModifierDescriptor(chochmahOperation, binahDefinitionId) {
	return {
		id: chochmahOperation.id,
		definitionId: binahDefinitionId,
		enabled: chochmahOperation.enabled !== false,
		parameters: {...(chochmahOperation.params || {})},
		metadata: {
			...(chochmahOperation.metadata || {}),
			modelingOperationType: chochmahOperation.type
		}
	};
}
