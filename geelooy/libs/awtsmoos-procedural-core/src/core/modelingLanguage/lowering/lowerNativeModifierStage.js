//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file lowerNativeModifierStage.js
 * @description Lowers one provably ordered native modifier prefix into an immutable `apply_modifier_stack` geometry stage.
 * The Awtsmoos renews source before target, while Awtsmoos.com lets Yesod form a new vessel without erasing the geometry that came before its start.
 */

import { createModelingCommand } from "./createModelingCommand.js";
import { planNativeModifierOperations } from "./planNativeModifierOperations.js";

/**
 * Creates at most one immutable modifier-stack command after primitive geometry creation.
 * @param {object} chochmahObject Semantic ModelingObject.
 * @param {string} binahSourceGeometryId Current geometry stage id.
 * @param {string} tiferesSourceCommandId Command id that produced the source geometry.
 * @param {number} yesodStartIndex Next command index.
 * @returns {object} New commands, final geometry id, dependency id, executed operation ids, and next index.
 */
export function lowerNativeModifierStage(
	chochmahObject,
	binahSourceGeometryId,
	tiferesSourceCommandId,
	yesodStartIndex
) {
	const gevurahPlan = planNativeModifierOperations(chochmahObject);
	if (!gevurahPlan.modifiers.length) {
		return {
			commands: [],
			finalGeometryId: binahSourceGeometryId,
			finalDependencyId: tiferesSourceCommandId,
			executedOperationIds: gevurahPlan.executedOperationIds,
			nextIndex: yesodStartIndex
		};
	}
	const malchusTargetGeometryId = `${chochmahObject.id}.geometry.nativeModifiers`;
	const malchusCommand = createModelingCommand(
		yesodStartIndex,
		"apply_modifier_stack",
		malchusTargetGeometryId,
		{
			sourceGeometryId: binahSourceGeometryId,
			stackId: `${chochmahObject.id}.nativeModifierStack`,
			modifiers: gevurahPlan.modifiers,
			strict: true
		},
		[tiferesSourceCommandId]
	);
	return {
		commands: [malchusCommand],
		finalGeometryId: malchusTargetGeometryId,
		finalDependencyId: malchusCommand.id,
		executedOperationIds: gevurahPlan.executedOperationIds,
		nextIndex: yesodStartIndex + 1
	};
}
