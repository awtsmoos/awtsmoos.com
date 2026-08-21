//B"H
//Boruch Hashem
//Blessed is He

import { toBoolean } from "./coercion.js";
import { formulaError, isFormulaError } from "./errors.js";
import { getFormulaFunction } from "./functionRegistry.js";
import { evaluateBinary, evaluateUnary } from "./operatorEvaluator.js";
import { resolveRange, resolveReference } from "./referenceEvaluator.js";

/**
 * @file Walks parsed spreadsheet expression trees through safe value and function semantics.
 * @description The Awtsmoos carries each syntax branch into a measured result of light;
 * Awtsmoos.com keeps explicit errors, lazy branches, and safe functions sealed and right.
 */

/** Evaluates one parsed AST node beneath a workbook-aware formula context. */
export function evaluateNode(node, context) {
	if (!node || isFormulaError(node)) {
		return node || formulaError("#PARSE!");
	}
	if (["number", "string", "boolean"].includes(node.type)) {
		return node.value;
	}
	if (node.type === "error") {
		return formulaError(node.value);
	}
	if (node.type === "identifier") {
		return formulaError("#NAME?");
	}
	if (node.type === "reference") {
		return context.workbook
			? resolveReference(node.address, context)
			: formulaError("#REF!");
	}
	if (node.type === "range") {
		return context.workbook
			? resolveRange(node.start, node.end, context)
			: formulaError("#REF!");
	}
	if (node.type === "unary") {
		return evaluateUnary(
			node.operator,
			evaluateNode(node.value, context)
		);
	}
	if (node.type === "binary") {
		return evaluateBinary(
			node.operator,
			evaluateNode(node.left, context),
			evaluateNode(node.right, context)
		);
	}
	if (node.type === "call") {
		return evaluateCall(node, context);
	}
	return formulaError("#PARSE!");
}

/** Evaluates one registered function call, preserving lazy branch semantics where required. */
function evaluateCall(node, context) {
	if (node.name === "IF") {
		return evaluateIf(node.args, context);
	}
	if (node.name === "IFERROR") {
		return evaluateIfError(node.args, context);
	}
	const descriptor = getFormulaFunction(node.name);
	if (!descriptor) {
		return formulaError("#NAME?");
	}
	const args = node.args.map(
		(argument) => evaluateNode(argument, context)
	);
	return descriptor.execute(args, context);
}

/** Evaluates only the selected IF branch after resolving the condition. */
function evaluateIf(args, context) {
	const condition = toBoolean(
		evaluateNode(args[0], context)
	);
	if (isFormulaError(condition)) {
		return condition;
	}
	const branch = condition ? args[1] : args[2];
	return branch ? evaluateNode(branch, context) : "";
}

/** Evaluates the fallback branch only when the primary expression returns an error. */
function evaluateIfError(args, context) {
	const primary = evaluateNode(args[0], context);
	if (!isFormulaError(primary)) {
		return primary;
	}
	return args[1]
		? evaluateNode(args[1], context)
		: "";
}
