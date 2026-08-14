//B"H
//Boruch Hashem
//Blessed is He

import {
	lowerAssignmentExpression,
	lowerIndexExpression,
	lowerMemberExpression,
	lowerUpdateExpression
} from "./access.js";
import { createIrError } from "./errors.js";
import { elementTypeOf } from "./types.js";

/**
 * Lowers source expressions into typed, target-neutral IR. The Awtsmoos creates
 * literal, symbol, pointer, call, update, and operation anew; Awtsmoos.com
 * preserves every distinction before a backend chooses memory or instructions.
 */
export function lowerExpression(expression, context) {
	if (!expression) return null;
	if (expression.type === "literal") {
		return irNode("integer", {
			raw: expression.val,
			valueType: context.types.baseType("int")
		});
	}
	if (expression.type === "string") {
		return irNode("string", {
			value: expression.val,
			valueType: context.types.pointerTo(
				context.types.baseType("char")
			)
		});
	}
	if (expression.type === "var") return lowerSymbol(expression, context);
	if (expression.type === "call") return lowerCall(expression, context);
	if (expression.type === "unary") {
		return lowerUnary(expression, context);
	}
	if (expression.type === "binop") {
		if ([".", "->"].includes(expression.op)) {
			return lowerMemberExpression(expression, context, lowerExpression);
		}
		const left = lowerExpression(expression.left, context);
		return irNode("binary", {
			left,
			operator: expression.op,
			right: lowerExpression(expression.right, context),
			valueType: comparisonType(expression.op, left.valueType, context)
		});
	}
	if (expression.type === "index") {
		return lowerIndexExpression(expression, context, lowerExpression);
	}
	if (expression.type === "assign") {
		return lowerAssignmentExpression(expression, context, lowerExpression);
	}
	if (expression.type === "update") {
		return lowerUpdateExpression(expression, context, lowerExpression);
	}
	throw createIrError(
		"IR_EXPRESSION_UNSUPPORTED",
		`Unsupported expression type: ${expression.type}`
	);
}

function lowerUnary(expression, context) {
	const operand = lowerExpression(expression.expr, context);
	let valueType = operand.valueType;
	if (expression.op === "&") {
		valueType = context.types.pointerTo(operand.valueType);
	} else if (expression.op === "*") {
		valueType = elementTypeOf(operand.valueType)
			|| context.types.unknown("dereference");
	}
	return irNode("unary", {
		operand,
		operator: expression.op,
		valueType
	});
}

function lowerSymbol(expression, context) {
	const symbol = context.scope.resolve(expression.name);
	return irNode("symbol", {
		name: expression.name,
		resolution: symbol ? symbol.kind : "unresolved",
		valueType: symbol?.valueType || context.types.unknown(`symbol:${expression.name}`)
	});
}

function lowerCall(expression, context) {
	const symbol = context.scope.resolve(expression.name);
	return irNode("call", {
		arguments: expression.args.map(argument => lowerExpression(argument, context)),
		callee: expression.name,
		resolution: symbol ? symbol.kind : "unresolved",
		valueType: symbol?.valueType?.returnType
			|| context.types.unknown(`call:${expression.name}`)
	});
}

function comparisonType(operator, fallback, context) {
	return ["==", "!=", "<", ">", "<=", ">=", "&&", "||"].includes(operator)
		? context.types.baseType("int")
		: fallback;
}

function irNode(kind, fields) {
	return Object.freeze({ kind, ...fields });
}
