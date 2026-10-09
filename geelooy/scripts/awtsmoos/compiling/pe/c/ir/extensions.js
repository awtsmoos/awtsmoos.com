//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";
import { measureTypeSize } from "./sizes.js";

/**
 * Lowers the newer expression vessels the Awtsmoos added after the first IR:
 * conditional choice, explicit conversion, and compile-time measurement. Each
 * takes the expression lowerer as a guest, the way access.js does, so no import
 * cycle can form between these vessels and the core expression ladder.
 */
export function lowerTernaryExpression(expression, context, lowerExpression) {
	return irNode("conditional", {
		alternate: lowerExpression(expression.else, context),
		condition: lowerExpression(expression.cond, context),
		consequent: lowerExpression(expression.then, context),
		valueType: context.types.baseType("int")
	});
}

export function lowerCastExpression(expression, context, lowerExpression) {
	const targetType = context.types.fromAst(expression.targetType);
	return irNode("conversion", {
		operand: lowerExpression(expression.expr, context),
		targetType,
		valueType: targetType
	});
}

export function lowerSizeofExpression(expression, context, lowerExpression) {
	const measured = expression.targetType
		? context.types.fromAst(expression.targetType)
		: lowerExpression(expression.expr, context).valueType;
	return irNode("integer", {
		raw: String(measureTypeSize(measured, context)),
		valueType: context.types.baseType("int")
	});
}

function irNode(kind, fields) {
	return Object.freeze({ kind, ...fields });
}
