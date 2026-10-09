//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";
import {
	emitAddressOfSymbol,
	emitLoadSymbol,
	isGlobal
} from "./storage.js";
import { CELL_BYTES } from "./types.js";

/**
 * Emits structure member access, array indexing, string literals, and the
 * lvalue addresses behind them. The Awtsmoos creates vessel, opening, and
 * word anew; Awtsmoos.com keeps every address computation in one place so
 * reads, writes, and address-of can never disagree on where a value lives.
 *
 * All multi-byte arithmetic uses the cell model: one 8-byte cell per scalar
 * element or field, aggregates laid out upward from element/field 0.
 */

/** Emits a string literal: RAX becomes a pointer to NUL-terminated bytes. */
export function emitPortableCString(node, context) {
	context.emit(`LEA RAX, ${context.strings.labelFor(node.value)}`);
}

/**
 * Reads an index or member lvalue into RAX.
 */
export function emitAggregateRead(node, context, emitExpression) {
	emitLvalueAddress(node, context, emitExpression);
	context.emit("MOV RAX, QWORD PTR [RAX]");
}

/**
 * Stores the value already in RAX into an index or member lvalue.
 */
export function emitAggregateStore(node, context, emitExpression) {
	context.emit("PUSH RAX");
	emitLvalueAddress(node, context, emitExpression);
	context.emit(
		"MOV R10, RAX",
		"POP RAX",
		"MOV QWORD PTR [R10], RAX"
	);
}

/**
 * Copies every cell of a structure value into a structure destination.
 * Both sides must be lvalues; RAX is clobbered.
 */
export function emitStructCopy(destination, value, context, emitExpression) {
	const destType = lvalueType(destination, context);
	if (destType?.kind !== "structure") {
		throw portableCError(
			"PORTABLE_C_STRUCT_COPY_TARGET",
			"Structure copy requires a structure destination"
		);
	}
	const cells = context.layout.structCells(destType.name);
	emitLvalueAddress(destination, context, emitExpression);
	context.emit("MOV R10, RAX");
	emitLvalueAddress(value, context, emitExpression);
	for (let cell = 0; cell < cells; cell += 1) {
		context.emit(
			"MOV RBX, QWORD PTR [RAX]",
			"MOV QWORD PTR [R10], RBX"
		);
		if (cell + 1 < cells) {
			context.emit(
				"ADD RAX, 8",
				"MOV RBX, R10",
				"ADD RBX, 8",
				"MOV R10, RBX"
			);
		}
	}
}

/**
 * Computes the address of an lvalue into RAX: symbol base, index element, or
 * member field. The address is always the lowest byte of the value's storage.
 */
export function emitLvalueAddress(node, context, emitExpression) {
	if (!node || typeof node !== "object") {
		throw portableCError(
			"PORTABLE_C_LVALUE_MISSING",
			"Missing lvalue for address computation"
		);
	}
	if (node.kind === "symbol") {
		emitAddressOfSymbol(node.name, context);
		return;
	}
	if (node.kind === "index") {
		emitIndexAddress(node, context, emitExpression);
		return;
	}
	if (node.kind === "member") {
		emitMemberAddress(node, context, emitExpression);
		return;
	}
	throw portableCError(
		"PORTABLE_C_LVALUE_UNSUPPORTED",
		`Cannot take the address of '${node.kind}'`
	);
}

/**
 * Loads a symbol as a value with C array-to-pointer decay: an array-typed
 * symbol evaluates to the address of its element 0, a function-typed symbol
 * evaluates to the function's address, and a structure-typed symbol cannot
 * be used as a value (structures travel by pointer).
 */
export function emitSymbolValue(node, context) {
	// Function designator: `onStart` in `activity->onStart = onStart` is the
	// function's address, not a stack slot.
	if (context.functions?.has(node.name)) {
		context.emit(`LEA RAX, ${node.name}`);
		return;
	}
	const kind = node.valueType?.kind;
	if (kind === "array") {
		emitAddressOfSymbol(node.name, context);
		return;
	}
	if (kind === "structure") {
		throw portableCError(
			"PORTABLE_C_STRUCT_VALUE",
			`Structure '${node.name}' cannot be used as a value; pass '&${node.name}' or access a field`
		);
	}
	emitLoadSymbol(node.name, context);
}

function emitIndexAddress(node, context, emitExpression) {
	emitIndexBase(node.target, context, emitExpression);
	context.emit("PUSH RAX");
	emitExpression(node.index, context);
	context.emit(
		"MOV RBX, 8",
		"IMUL RAX, RBX",
		"POP RBX",
		"ADD RAX, RBX"
	);
}

/**
 * Computes the element-0 base address behind an index target. Nested index
 * and member targets contribute addresses (not loaded values); array symbols
 * decay; pointer symbols load; string literals address their bytes.
 */
function emitIndexBase(target, context, emitExpression) {
	if (target?.kind === "index" || target?.kind === "member") {
		emitLvalueAddress(target, context, emitExpression);
		return;
	}
	if (target?.kind === "symbol") {
		emitSymbolValue(target, context);
		return;
	}
	emitExpression(target, context);
}

function emitMemberAddress(node, context, emitExpression) {
	const structName = memberStructName(node, context);
	const offsetCells = context.layout.fieldOffsetCells(structName, node.field);
	if (node.throughPointer) {
		emitExpression(node.target, context);
	} else {
		emitLvalueAddress(node.target, context, emitExpression);
	}
	addCellOffset(context, offsetCells);
}

function memberStructName(node, context) {
	let targetType = node.target?.kind === "symbol"
		? symbolType(node.target.name, context) || node.target.valueType
		: node.target?.valueType;
	if (node.throughPointer) {
		if (targetType?.kind !== "pointer") {
			throw portableCError(
				"PORTABLE_C_MEMBER_TARGET",
				`'->' requires a pointer target`
			);
		}
		targetType = targetType.pointee;
	}
	if (targetType?.kind !== "structure") {
		throw portableCError(
			"PORTABLE_C_MEMBER_TARGET",
			`Member access requires a structure target`
		);
	}
	return targetType.name;
}

function lvalueType(node, context) {
	if (node?.kind === "symbol") {
		return symbolType(node.name, context) || node.valueType;
	}
	return node?.valueType;
}

function symbolType(name, context) {
	if (context.frame?.has(name)) {
		return context.frame.typeOf(name);
	}
	if (context.globalTypes?.has(String(name))) {
		return context.globalTypes.get(String(name));
	}
	return null;
}

/** Adds a cell-count-scaled byte offset to the address in RAX. */
function addCellOffset(context, offsetCells) {
	if (!offsetCells) return;
	const bytes = offsetCells * CELL_BYTES;
	if (bytes <= 4095) {
		context.emit(`ADD RAX, ${bytes}`);
		return;
	}
	context.emit(`MOV R10, ${bytes}`, "ADD RAX, R10");
}

/** True when the destination is a whole-structure lvalue (cell copy path). */
export function isStructDestination(destination, context) {
	return destination?.kind === "symbol"
		&& symbolType(destination.name, context)?.kind === "structure";
}

/**
 * Emits an aggregate declaration: zero-initializes every cell, or copies a
 * string literal into a char array cell by cell. Returns true when the
 * declaration was an aggregate (the caller skips the scalar path).
 */
export function emitAggregateDeclaration(node, context) {
	const kind = node.valueType?.kind;
	if (kind !== "array" && kind !== "structure") return false;
	const cells = context.layout.cellCount(node.valueType);
	if (!node.initializer) {
		zeroCells(context, node.name, cells);
		return true;
	}
	if (node.initializer.kind === "string" && kind === "array") {
		initCharArray(context, node.name, cells, String(node.initializer.value));
		return true;
	}
	throw portableCError(
		"PORTABLE_C_AGGREGATE_INIT_UNSUPPORTED",
		`Declaration '${node.name}' has an unsupported aggregate initializer '${node.initializer?.kind}'`
	);
}

function zeroCells(context, name, cells) {
	const base = context.frame.baseOffset(name);
	for (let cell = 0; cell < cells; cell += 1) {
		context.emit(
			"MOV RAX, 0",
			`MOV QWORD PTR [RBP-${base - cell * CELL_BYTES}], RAX`
		);
	}
}

function initCharArray(context, name, cells, text) {
	const bytes = [...text].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	if (bytes.length > cells) {
		throw portableCError(
			"PORTABLE_C_AGGREGATE_INIT_UNSUPPORTED",
			`String initializer overflows '${name}' (${bytes.length} bytes into ${cells} cells)`
		);
	}
	const base = context.frame.baseOffset(name);
	for (let cell = 0; cell < cells; cell += 1) {
		const byte = cell < bytes.length ? bytes[cell] : 0;
		context.emit(
			`MOV RAX, ${byte}`,
			`MOV QWORD PTR [RBP-${base - cell * CELL_BYTES}], RAX`
		);
	}
}
