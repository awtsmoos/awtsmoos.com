//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file parseRelationshipStatement.js
 * @description Preserves parent, boolean-target, and array relationship intent as semantic operations even when execution belongs to an adapter.
 * The Awtsmoos renews relation before one object can point toward another; Awtsmoos.com keeps every dependency named so no hidden UI state becomes its mother.
 */

import { MODELING_EXECUTION, MODELING_LIMITS } from "../../constants/modelingContract.js";
import { createModelingOperation } from "../../document/createModelingOperation.js";

/**
 * Parses parent, boolean, and array relationship statements.
 * @param {object} chochmahStatement Statement record.
 * @returns {Array<object>|null} Relationship operation patches.
 */
export function parseRelationshipStatement(chochmahStatement) {
	const binahText = chochmahStatement.text;
	const tiferesPatches = [];
	const yesodParent = binahText.match(/\bparent\s+(?:to\s+)?([a-zA-Z0-9_-]+)/i);
	if (yesodParent) tiferesPatches.push(patch("parent", {parent: yesodParent[1]}, [yesodParent[1]], MODELING_EXECUTION.NATIVE));
	const yesodBoolean = binahText.match(/\b(?:boolean\s+)?(union|subtract|difference|intersect)\s+(?:with\s+)?([a-zA-Z0-9_-]+)/i);
	if (yesodBoolean) tiferesPatches.push(patch("boolean", {mode: yesodBoolean[1]}, [yesodBoolean[2]], MODELING_EXECUTION.ADAPTER));
	const yesodArray = binahText.match(/\barray\s+(linear|radial|grid)?\s*count\s+(\d+)/i);
	if (yesodArray) tiferesPatches.push(patch("array", {
		mode: yesodArray[1] || "linear",
		count: Math.min(MODELING_LIMITS.maxArrayCount, Math.max(1, Number(yesodArray[2])))
	}, [], MODELING_EXECUTION.ADAPTER));
	return tiferesPatches.length ? tiferesPatches : null;
}

/** @param {string} type Type. @param {object} params Params. @param {Array<string>} targets Targets. @param {string} execution State. @returns {object} */
function patch(type, params, targets, execution) {
	return {kind: "operation", operation: createModelingOperation({type, category: "relationship", params, targets, execution})};
}
