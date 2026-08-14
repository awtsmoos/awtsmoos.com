//B"H
//Boruch Hashem
//Blessed is He

import { emitPortableCCall } from "./calls.js";
import { portableCError, rejectPortableC } from "./errors.js";
import {
	emitPortableCBinary,
	emitPortableCUnary,
	portableIntegerValue
} from "./expressionOperations.js";
import {
	emitAddressExpression,
	emitLoadSymbol,
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
	if (node.kind === "symbol") {
		emitLoadSymbol(node.name, context);
		return;
	}
	if (node.kind === "assign") {
		emitPortableCExpression(node.value, context);
		emitStoreDestination(node.destination, context, emitPortableCExpression);
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
