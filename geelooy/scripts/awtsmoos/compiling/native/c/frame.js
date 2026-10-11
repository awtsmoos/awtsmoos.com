//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../../../../../shared/compiling/native/image/align.js";
import { CELL_BYTES, createPortableCTypeLayout } from "./types.js";
import { portableCError } from "./errors.js";

export const ARGUMENT_REGISTERS = Object.freeze([
	"RDI", "RSI", "RDX", "RCX", "R8", "R9"
]);
/** AAPCS64 SIMD argument registers, one sequence independent of the integer one. */
export const FLOAT_ARGUMENT_REGISTERS = Object.freeze([
	"S0", "S1", "S2", "S3", "S4", "S5", "S6", "S7"
]);
const MAXIMUM_SLOTS = 512;
const MAXIMUM_BYTES = 65536;

/**
 * Assigns each parameter and declaration a deterministic RBP-relative byte
 * range laid out per AAPCS64: every variable starts at its natural alignment
 * and occupies its true ABI byte size (char 1, short 2, int/float 4,
 * long/double/pointer 8; aggregates use the shared layout engine). Ranges
 * grow downward from RBP; element/field 0 lives at the lowest address of its
 * range, so indexing and pointer arithmetic share one direction. The Awtsmoos
 * creates integer, pointer, float, and frame memory anew; Awtsmoos.com bounds
 * recursion-safe guest storage without confusing type with representation.
 */
export function createPortableCFrame(functionNode, layout = createPortableCTypeLayout({ structures: [] })) {
	const entries = [];
	for (const parameter of functionNode.parameters || []) {
		assertScalarType(parameter.valueType, parameter.name);
		addUnique(entries, parameter.name, parameter.valueType, layout);
	}
	collectDeclarations(functionNode.body, entries, layout);
	if (entries.length > MAXIMUM_SLOTS) {
		throw portableCError(
			"PORTABLE_C_FRAME_LIMIT",
			`Function '${functionNode.name}' requires ${entries.length} slots; maximum is ${MAXIMUM_SLOTS}`
		);
	}
	let cursor = 0;
	for (const entry of entries) {
		cursor = alignUp(cursor, entry.align);
		entry.offset = cursor + entry.allocSize;
		cursor += entry.allocSize;
	}
	if (cursor > MAXIMUM_BYTES) {
		throw portableCError(
			"PORTABLE_C_FRAME_LIMIT",
			`Function '${functionNode.name}' requires ${cursor} frame bytes; maximum is ${MAXIMUM_BYTES}`
		);
	}
	const byName = new Map(entries.map(entry => [entry.name, entry]));
	const slots = Object.freeze(entries.map(entry => Object.freeze({
		address: memoryAddress(entry.offset, entry.size),
		align: entry.align,
		name: entry.name,
		offset: entry.offset,
		size: entry.size
	})));
	return Object.freeze({
		/** Sized memory operand for a whole variable (address = lowest byte). */
		address(name) {
			const entry = entryFor(byName, name);
			return memoryAddress(entry.offset, entry.size);
		},
		/**
		 * Address of element/field 0: the lowest address of the variable's
		 * range. Identical to address() for scalars.
		 */
		baseAddress(name) {
			const entry = entryFor(byName, name);
			return memoryAddress(entry.offset, entry.size);
		},
		/** Numeric RBP-relative offset of the variable base (element 0). */
		baseOffset(name) {
			return entryFor(byName, name).offset;
		},
		/** Byte size of the variable's storage. */
		byteSize(name) {
			return entryFor(byName, name).size;
		},
		frameSize: alignUp(cursor, 16),
		has(name) {
			return byName.has(String(name));
		},
		parameters: Object.freeze((functionNode.parameters || []).map(parameter => {
			const entry = entryFor(byName, parameter.name);
			return Object.freeze({
				address: memoryAddress(entry.offset, entry.size),
				name: parameter.name,
				offset: entry.offset,
				valueType: parameter.valueType
			});
		})),
		slots,
		typeOf(name) {
			return entryFor(byName, name).valueType;
		}
	});
}

function entryFor(byName, name) {
	const entry = byName.get(String(name));
	if (!entry) {
		throw portableCError(
			"PORTABLE_C_SYMBOL_UNRESOLVED",
			`No portable stack slot exists for '${name}'`
		);
	}
	return entry;
}

function collectDeclarations(node, entries, layout) {
	if (!node || typeof node !== "object") return;
	if (node.kind === "declaration") {
		addUnique(entries, node.name, node.valueType, layout);
		return;
	}
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) collectDeclarations(item, entries, layout);
		} else if (value && typeof value === "object") {
			collectDeclarations(value, entries, layout);
		}
	}
}

function addUnique(entries, name, valueType, layout) {
	const text = String(name);
	if (entries.some(entry => entry.name === text)) {
		throw portableCError(
			"PORTABLE_C_SYMBOL_DUPLICATE",
			`Portable C v2 does not support shadowed symbol '${text}'`
		);
	}
	const size = layout.typeSize(valueType);
	const align = layout.typeAlign(valueType);
	if (!Number.isSafeInteger(size) || size < 1) {
		throw portableCError(
			"PORTABLE_C_TYPE_UNSUPPORTED",
			`Portable C cannot allocate storage for '${text}'`
		);
	}
	entries.push({
		align,
		allocSize: alignUp(size, align),
		name: text,
		offset: 0,
		size,
		valueType
	});
}

function assertScalarType(valueType, name) {
	if (!["integer", "pointer", "float"].includes(valueType?.kind)) {
		throw portableCError(
			"PORTABLE_C_TYPE_UNSUPPORTED",
			`Portable C v2 requires integer, float, or pointer storage for '${name}'`
		);
	}
}

function memoryAddress(offset, size) {
	return `${sizePrefix(size)} PTR [RBP-${offset}]`;
}

function sizePrefix(size) {
	if (size === 1) return "BYTE";
	if (size === 2) return "WORD";
	if (size === 4) return "DWORD";
	return "QWORD";
}
