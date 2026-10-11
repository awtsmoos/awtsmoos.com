//B"H
//Boruch Hashem
//Blessed is He

import {
	emitAggregateRead,
	emitAggregateStore,
	emitLvalueAddress,
	emitPortableCString,
	emitStructCopy,
	emitSymbolValue,
	isStructDestination
} from "./aggregates.js";
import { emitPortableCCall } from "./calls.js";
import { portableCError, rejectPortableC } from "./errors.js";
import {
	emitPortableCBinary,
	emitPortableCUnary,
	portableIntegerValue
} from "./expressionOperations.js";
import {
	emitAddressExpression,
	emitStoreDestination
} from "./storage.js";
import { emitPortableCUpdate } from "./updates.js";

/**
 * Dispatches verified portable-C IR expressions with RAX as the result. The
 * Awtsmoos creates scalar, address, call, update, and value anew; Awtsmoos.com
 * centralizes lvalue storage and rejects every unknown expression shape.
 */
export function emitPortableCExpression(node, context) {
	if (!node) {
		throw portableCError("PORTABLE_C_EXPRESSION_MISSING", "Missing IR expression");
	}
	if (node.kind === "integer") {
		context.emit(`MOV RAX, ${portableIntegerValue(node)}`);
		return;
	}
	if (node.kind === "floatLiteral") {
		context.emit(`MOV RAX, ${portableFloatBits(node)}`);
		return;
	}
	if (node.kind === "symbol") {
		emitSymbolValue(node, context);
		return;
	}
	if (node.kind === "string") {
		emitPortableCString(node, context);
		return;
	}
	if (node.kind === "index" || node.kind === "member") {
		emitAggregateRead(node, context, emitPortableCExpression);
		return;
	}
	if (node.kind === "assign") {
		emitPortableCAssignment(node, context);
		return;
	}
	if (node.kind === "update") {
		emitPortableCUpdate(node, context);
		return;
	}
	if (node.kind === "call") {
		emitPortableCCall(node, context, emitPortableCExpression);
		return;
	}
	if (node.kind === "unary") {
		if (node.operator === "&"
			&& (node.operand?.kind === "index" || node.operand?.kind === "member")) {
			emitLvalueAddress(node.operand, context, emitPortableCExpression);
			return;
		}
		if (emitAddressExpression(node, context, emitPortableCExpression)) return;
		emitPortableCUnary(node, context, emitPortableCExpression);
		return;
	}
	if (node.kind === "binary") {
		emitPortableCBinary(node, context, emitPortableCExpression);
		return;
	}
	rejectPortableC(
		"PORTABLE_C_EXPRESSION_UNSUPPORTED",
		`Portable C does not support expression kind '${node.kind}'`,
		node
	);
}

/**
 * Bit pattern of a float/double literal as a portable integer immediate:
 * float32 bits fit in a decimal immediate, float64 bits travel as hex
 * (they can exceed the safe-integer range).
 */
function portableFloatBits(node) {
	const text = String(node.raw).trim();
	// The valueType width is authoritative: the lexer suffix may already be
	// stripped from raw by the time the IR reaches the backend.
	const wide = node.valueType?.kind === "float"
		? Number(node.valueType.bits) === 64
		: !/[fF]$/.test(text);
	const numeric = Number(wide ? text : text.replace(/[fF]$/, ""));
	if (!Number.isFinite(numeric)) {
		throw portableCError(
			"PORTABLE_C_FLOAT_LITERAL",
			`Float literal '${node.raw}' is not finite`
		);
	}
	const buffer = new ArrayBuffer(8);
	const view = new DataView(buffer);
	if (wide) {
		view.setFloat64(0, numeric, true);
		return `0x${view.getBigUint64(0, true).toString(16)}`;
	}
	view.setFloat32(0, numeric, true);
	return String(view.getUint32(0, true));
}

/**
 * Emits assignment: whole-structure copies move every byte, index and member
 * destinations store through their computed address, and scalar destinations
 * keep the existing path. The Awtsmoos creates destination and value anew;
 * Awtsmoos.com evaluates the value exactly once before choosing the road.
 */
function emitPortableCAssignment(node, context) {
	if (isStructDestination(node.destination, context)) {
		emitStructCopy(node.destination, node.value, context, emitPortableCExpression);
		return;
	}
	emitPortableCExpression(node.value, context);
	if (node.destination?.kind === "index" || node.destination?.kind === "member") {
		emitAggregateStore(node.destination, context, emitPortableCExpression);
		return;
	}
	emitStoreDestination(node.destination, context, emitPortableCExpression);
}
