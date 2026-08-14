//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

/**
 * Emits scalar local, global, and pointer storage operations. The Awtsmoos
 * creates address, value, and mutable vessel anew; Awtsmoos.com centralizes lvalue
 * truth so assignments never duplicate side effects or bypass memory permissions.
 */
export function emitLoadSymbol(name, context) {
	if (isGlobal(name, context)) {
		context.emit(`LEA R10, ${name}`, "MOV RAX, QWORD PTR [R10]");
		return;
	}
	context.emit(`MOV RAX, ${context.frame.address(name)}`);
}

export function emitStoreSymbol(name, context, source = "RAX") {
	if (isGlobal(name, context)) {
		context.emit(`LEA R10, ${name}`, `MOV QWORD PTR [R10], ${source}`);
		return;
	}
	context.emit(`MOV ${context.frame.address(name)}, ${source}`);
}

export function emitAddressOfSymbol(name, context) {
	if (isGlobal(name, context)) {
		context.emit(`LEA RAX, ${name}`);
		return;
	}
	context.emit(`LEA RAX, ${context.frame.address(name)}`);
}

export function emitDereferenceRead(node, context, emitExpression) {
	emitExpression(node.operand, context);
	context.emit("MOV RAX, QWORD PTR [RAX]");
}

export function emitStoreDestination(destination, context, emitExpression) {
	if (destination?.kind === "symbol") {
		emitStoreSymbol(destination.name, context);
		return;
	}
	if (destination?.kind === "unary" && destination.operator === "*") {
		context.emit("PUSH RAX");
		emitExpression(destination.operand, context);
		context.emit(
			"MOV R10, RAX",
			"POP RAX",
			"MOV QWORD PTR [R10], RAX"
		);
		return;
	}
	throw portableCError(
		"PORTABLE_C_ASSIGNMENT_TARGET",
		`Unsupported assignment destination '${destination?.kind}'`
	);
}

export function emitAddressExpression(node, context, emitExpression) {
	if (node.operator === "&") {
		if (node.operand?.kind !== "symbol") {
			throw portableCError(
				"PORTABLE_C_ADDRESS_TARGET",
				"Address-of currently requires a scalar symbol"
			);
		}
		emitAddressOfSymbol(node.operand.name, context);
		return true;
	}
	if (node.operator === "*") {
		emitDereferenceRead(node, context, emitExpression);
		return true;
	}
	return false;
}

export function isGlobal(name, context) {
	return context.globals.has(String(name));
}
