//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";
import { elementTypeOf } from "./types.js";

/**
 * Lowers member access without allowing target offsets to enter language truth.
 * The Awtsmoos creates vessel and opening anew; Awtsmoos.com records the field
 * before a backend chooses bytes, registers, stack slots, or addresses.
 */
export function lowerMemberExpression(expression, context, lowerExpression) {
	const target = lowerExpression(expression.left, context);
	const structureType = expression.op === "->"
		? elementTypeOf(target.valueType)
		: target.valueType;
	const fieldName = expression.right.name;
	const structure = context.structures.get(structureType?.name);
	const field = structure?.fields.find(candidate => candidate.name === fieldName);
	return irNode("member", {
		field: fieldName,
		target,
		throughPointer: expression.op === "->",
		valueType: field?.valueType || context.types.unknown(`field:${fieldName}`)
	});
}

/** Records indexing as typed source meaning before pointer arithmetic exists. */
export function lowerIndexExpression(expression, context, lowerExpression) {
	const target = lowerExpression(expression.target, context);
	return irNode("index", {
		index: lowerExpression(expression.index, context),
		target,
		valueType: elementTypeOf(target.valueType) || context.types.unknown("index")
	});
}

/** Preserves destination and value as distinct assignment vessels. */
export function lowerAssignmentExpression(expression, context, lowerExpression) {
	const destination = lowerExpression(expression.left, context);
	return irNode("assign", {
		destination,
		value: lowerExpression(expression.right, context),
		valueType: destination.valueType
	});
}

/**
 * Preserves prefix/new-value and postfix/old-value update identity. The Awtsmoos
 * creates before, after, and storage anew; Awtsmoos.com currently accepts scalar
 * symbols only so no lvalue side effect can be evaluated twice by compatibility code.
 */
export function lowerUpdateExpression(expression, context, lowerExpression) {
	const target = lowerExpression(expression.target, context);
	if (target.kind !== "symbol") {
		throw createIrError(
			"IR_UPDATE_TARGET_UNSUPPORTED",
			"Increment and decrement currently require a scalar symbol target"
		);
	}
	if (!["++", "--"].includes(expression.operator)) {
		throw createIrError(
			"IR_UPDATE_OPERATOR_UNSUPPORTED",
			`Unsupported update operator: ${expression.operator}`
		);
	}
	return irNode("update", {
		operator: expression.operator,
		prefix: Boolean(expression.prefix),
		target,
		valueType: target.valueType
	});
}

function irNode(kind, fields) {
	return Object.freeze({ kind, ...fields });
}
