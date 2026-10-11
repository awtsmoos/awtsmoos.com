//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";
import {
	emitAddressOfSymbol,
	emitLoadSymbol
} from "./storage.js";

/**
 * Emits structure member access, array indexing, string literals, and the
 * lvalue addresses behind them. The Awtsmoos creates vessel, opening, and
 * word anew; Awtsmoos.com keeps every address computation in one place so
 * reads, writes, and address-of can never disagree on where a value lives.
 *
 * All addresses are byte addresses per AAPCS64: member offsets, alignment,
 * and padding come from the shared layout engine, array elements pack at
 * their natural stride, and every access uses the width of the accessed
 * type (LDRB/LDRH/LDR for unsigned, LDRSB/LDRSH/LDRSW for signed).
 */

/** Emits a string literal: RAX becomes a pointer to NUL-terminated bytes. */
export function emitPortableCString(node, context) {
	context.emit(`LEA RAX, ${context.strings.labelFor(node.value)}`);
}

/**
 * Reads an index or member lvalue into RAX, using the access width of the
 * lvalue's type. A structure-typed lvalue cannot be read as a value;
 * structures travel by pointer.
 */
export function emitAggregateRead(node, context, emitExpression) {
	const access = accessOf(lvalueType(node, context), context);
	if (access.bytes > 8) {
		throw portableCError(
			"PORTABLE_C_STRUCT_VALUE",
			"Structure values cannot be read into a register; take the address or access a field"
		);
	}
	emitLvalueAddress(node, context, emitExpression);
	context.emit(`MOV${access.signed ? "SX" : ""} RAX, ${access.ptr} [RAX]`);
}

/**
 * Stores the value already in RAX into an index or member lvalue, using the
 * access width of the lvalue's type (narrow stores truncate, as in C).
 */
export function emitAggregateStore(node, context, emitExpression) {
	const access = accessOf(lvalueType(node, context), context);
	if (access.bytes > 8) {
		throw portableCError(
			"PORTABLE_C_STRUCT_VALUE",
			"Structure values cannot be stored from a register; use whole-structure copy"
		);
	}
	context.emit("PUSH RAX");
	emitLvalueAddress(node, context, emitExpression);
	context.emit(
		"MOV R10, RAX",
		"POP RAX",
		`MOV ${access.ptr} [R10], RAX`
	);
}

/**
 * Copies every byte of a structure value into a structure destination.
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
	const size = context.layout.structSize(destType.name);
	emitLvalueAddress(destination, context, emitExpression);
	context.emit("MOV R10, RAX");
	emitLvalueAddress(value, context, emitExpression);
	let done = 0;
	while (done + 8 <= size) {
		context.emit(
			"MOV RBX, QWORD PTR [RAX]",
			"MOV QWORD PTR [R10], RBX"
		);
		done += 8;
		if (done < size) {
			context.emit("ADD RAX, 8", "ADD R10, 8");
		}
	}
	const tail = size - done;
	if (tail >= 4) {
		context.emit(
			"MOV RBX, DWORD PTR [RAX]",
			"MOV DWORD PTR [R10], RBX"
		);
		done += 4;
	}
	if (size - done >= 2) {
		context.emit(
			"MOV RBX, WORD PTR [RAX]",
			"MOV WORD PTR [R10], RBX"
		);
		done += 2;
	}
	if (size - done >= 1) {
		context.emit(
			"MOV RBX, BYTE PTR [RAX]",
			"MOV BYTE PTR [R10], RBX"
		);
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
	const stride = accessOf(elementTypeOf(node, context), context).bytes;
	emitIndexBase(node.target, context, emitExpression);
	if (stride === 1) {
		context.emit("PUSH RAX");
		emitExpression(node.index, context);
		context.emit("POP RBX", "ADD RAX, RBX");
		return;
	}
	context.emit("PUSH RAX");
	emitExpression(node.index, context);
	context.emit(
		`MOV RBX, ${stride}`,
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
	let offset;
	try {
		offset = context.layout.fieldOffset(structName, node.field);
	} catch (error) {
		throw portableCError(
			"PORTABLE_C_STRUCT_FIELD_UNKNOWN",
			`Structure '${structName}' has no field '${node.field}'`
		);
	}
	if (node.throughPointer) {
		emitExpression(node.target, context);
	} else {
		emitLvalueAddress(node.target, context, emitExpression);
	}
	addByteOffset(context, offset);
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

/** Field type from the AAPCS64 layout; unknown fields fail closed. */
function fieldType(structName, field, context) {
	try {
		return context.layout.fieldType(structName, field);
	} catch (error) {
		throw portableCError(
			"PORTABLE_C_STRUCT_FIELD_UNKNOWN",
			`Unknown field '${field}' on struct '${structName}'`
		);
	}
}

function lvalueType(node, context) {
	if (node?.kind === "symbol") {
		return symbolType(node.name, context) || node.valueType;
	}
	if (node?.kind === "member") {
		return fieldType(memberStructName(node, context), node.field, context);
	}
	if (node?.kind === "index") {
		return elementTypeOf(node, context);
	}
	return node?.valueType;
}

/** Element type behind an index node: the indexed value's element type. */
function elementTypeOf(node, context) {
	const targetType = node.target?.kind === "symbol"
		? symbolType(node.target.name, context) || node.target?.valueType
		: node.target?.valueType;
	if (targetType?.kind === "array") return targetType.elementType;
	if (targetType?.kind === "pointer") return targetType.pointee;
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

/**
 * Access width for a value type: byte size plus whether loads sign-extend.
 * Unsigned integers zero-extend; signed integers sign-extend; pointers and
 * floats are 8 bytes.
 */
export function accessOf(valueType, context) {
	const kind = valueType?.kind;
	if (kind === "integer") {
		const bytes = Math.max(1, Math.ceil(Number(valueType.bits || 32) / 8));
		if (bytes !== 1 && bytes !== 2 && bytes !== 4 && bytes !== 8) {
			throw portableCError(
				"PORTABLE_C_TYPE_UNSUPPORTED",
				`Portable C has no access width for '${bytes}'-byte integers`
			);
		}
		return { bytes, ptr: `${sizePrefix(bytes)} PTR`, signed: valueType.signed !== false };
	}
	if (kind === "pointer" || kind === "float") {
		const bytes = valueType.kind === "float" && Number(valueType.bits) === 32 ? 4 : 8;
		return { bytes, ptr: `${sizePrefix(bytes)} PTR`, signed: false };
	}
	if (kind === "array" || kind === "structure") {
		return { bytes: context.layout.typeSize(valueType), ptr: "QWORD PTR", signed: false };
	}
	throw portableCError(
		"PORTABLE_C_TYPE_UNSUPPORTED",
		`Portable C cannot access type kind '${kind}'`
	);
}

function sizePrefix(bytes) {
	if (bytes === 1) return "BYTE";
	if (bytes === 2) return "WORD";
	if (bytes === 4) return "DWORD";
	return "QWORD";
}

/** Adds a byte offset to the address in RAX. */
function addByteOffset(context, offset) {
	if (!offset) return;
	if (offset <= 4095) {
		context.emit(`ADD RAX, ${offset}`);
		return;
	}
	context.emit(`MOV R10, ${offset}`, "ADD RAX, R10");
}

/** True when the destination is a whole-structure lvalue (struct copy path). */
export function isStructDestination(destination, context) {
	const type = destination?.kind === "symbol"
		? symbolType(destination.name, context)
		: destination?.valueType;
	return type?.kind === "structure";
}

/**
 * Emits an aggregate declaration: zero-initializes every byte, or copies a
 * string literal into a char array byte by byte. Returns true when the
 * declaration was an aggregate (the caller skips the scalar path).
 */
export function emitAggregateDeclaration(node, context) {
	const kind = node.valueType?.kind;
	if (kind !== "array" && kind !== "structure") return false;
	const size = context.layout.typeSize(node.valueType);
	if (!node.initializer) {
		zeroBytes(context, node.name, size);
		return true;
	}
	if (node.initializer.kind === "string" && kind === "array") {
		initCharArray(context, node.name, size, String(node.initializer.value));
		return true;
	}
	throw portableCError(
		"PORTABLE_C_AGGREGATE_INIT_UNSUPPORTED",
		`Declaration '${node.name}' has an unsupported aggregate initializer '${node.initializer?.kind}'`
	);
}

function zeroBytes(context, name, size) {
	const base = context.frame.baseOffset(name);
	context.emit("MOV RAX, 0");
	let done = 0;
	while (done + 8 <= size) {
		context.emit(`MOV QWORD PTR [RBP-${base - done}], RAX`);
		done += 8;
	}
	if (size - done >= 4) {
		context.emit(`MOV DWORD PTR [RBP-${base - done}], RAX`);
		done += 4;
	}
	if (size - done >= 2) {
		context.emit(`MOV WORD PTR [RBP-${base - done}], RAX`);
		done += 2;
	}
	if (size - done >= 1) {
		context.emit(`MOV BYTE PTR [RBP-${base - done}], RAX`);
	}
}

function initCharArray(context, name, size, text) {
	const bytes = [...text].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	if (bytes.length > size) {
		throw portableCError(
			"PORTABLE_C_AGGREGATE_INIT_UNSUPPORTED",
			`String initializer overflows '${name}' (${bytes.length} bytes into ${size} bytes)`
		);
	}
	zeroBytes(context, name, size);
	const base = context.frame.baseOffset(name);
	for (let index = 0; index < bytes.length; index += 1) {
		context.emit(
			`MOV RAX, ${bytes[index]}`,
			`MOV BYTE PTR [RBP-${base - index}], RAX`
		);
	}
}
