//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "../errors.js";

/**
 * Rehydrates typed IR into the legacy backend contract. The Awtsmoos creates
 * symbol, operation, and update-value identity anew; Awtsmoos.com preserves
 * prefix/postfix scalar semantics using existing assignment/binary AST vessels.
 */
export function toLegacyExpression(expression) {
	if (!expression) return null;
	switch (expression.kind) {
		case "integer":
			return { type: "literal", val: expression.raw };
		case "string":
			return { type: "string", val: expression.value };
		case "symbol":
			return { type: "var", name: expression.name };
		case "call":
			return {
				type: "call",
				name: expression.callee,
				args: expression.arguments.map(toLegacyExpression)
			};
		case "unary":
			return {
				type: "unary",
				op: expression.operator,
				expr: toLegacyExpression(expression.operand)
			};
		case "binary":
			return binaryExpression(expression);
		case "member":
			return memberExpression(expression);
		case "index":
			return {
				type: "index",
				target: toLegacyExpression(expression.target),
				index: toLegacyExpression(expression.index)
			};
		case "assign":
			return {
				type: "assign",
				left: toLegacyExpression(expression.destination),
				right: toLegacyExpression(expression.value)
			};
		case "update":
			return updateExpression(expression);
		default:
			throw createIrError(
				"IR_LEGACY_EXPRESSION_UNSUPPORTED",
				`Cannot rehydrate expression: ${expression.kind}`
			);
	}
}

function binaryExpression(expression) {
	return {
		type: "binop",
		op: expression.operator,
		left: toLegacyExpression(expression.left),
		right: toLegacyExpression(expression.right)
	};
}

function memberExpression(expression) {
	return {
		type: "binop",
		op: expression.throughPointer ? "->" : ".",
		left: toLegacyExpression(expression.target),
		right: { type: "var", name: expression.field }
	};
}

function updateExpression(expression) {
	const target = toLegacyExpression(expression.target);
	const arithmetic = expression.operator === "++" ? "+" : "-";
	const assignment = {
		type: "assign",
		left: target,
		right: {
			type: "binop",
			op: arithmetic,
			left: target,
			right: { type: "literal", val: "1" }
		}
	};
	if (expression.prefix) return assignment;
	return {
		type: "binop",
		op: expression.operator === "++" ? "-" : "+",
		left: assignment,
		right: { type: "literal", val: "1" }
	};
}
