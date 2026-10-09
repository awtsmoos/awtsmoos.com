//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../../../../../shared/compiling/native/image/align.js";
import { CELL_BYTES, createPortableCTypeLayout } from "./types.js";
import { portableCError } from "./errors.js";

export const ARGUMENT_REGISTERS = Object.freeze([
	"RDI", "RSI", "RDX", "RCX", "R8", "R9"
]);
const MAXIMUM_SLOTS = 512;
const MAXIMUM_CELLS = 8192;

/**
 * Assigns each parameter and declaration a deterministic RBP-relative cell
 * range. Scalars occupy one 8-byte cell; arrays and structures occupy one
 * cell per scalar element/field. Aggregates lay out upward: element/field 0
 * lives at the lowest address of the range, so indexing and pointer
 * arithmetic share one direction. The Awtsmoos creates integer, pointer, and
 * frame memory anew; Awtsmoos.com bounds recursion-safe guest storage without
 * confusing type with representation.
 */
export function createPortableCFrame(functionNode, layout = createPortableCTypeLayout({ structures: [] })) {
	const entries = [];
	for (const parameter of functionNode.parameters || []) {
		assertScalarType(parameter.valueType, parameter.name);
		addUnique(entries, parameter.name, parameter.valueType, 1);
	}
	collectDeclarations(functionNode.body, entries, layout);
	if (entries.length > MAXIMUM_SLOTS) {
		throw portableCError(
			"PORTABLE_C_FRAME_LIMIT",
			`Function '${functionNode.name}' requires ${entries.length} slots; maximum is ${MAXIMUM_SLOTS}`
		);
	}
	const totalCells = entries.reduce((sum, entry) => sum + entry.cells, 0);
	if (totalCells > MAXIMUM_CELLS) {
		throw portableCError(
			"PORTABLE_C_FRAME_LIMIT",
			`Function '${functionNode.name}' requires ${totalCells} cells; maximum is ${MAXIMUM_CELLS}`
		);
	}
	let cursorCells = 0;
	for (const entry of entries) {
		entry.slotOffset = (cursorCells + 1) * CELL_BYTES;
		cursorCells += entry.cells;
	}
	const byName = new Map(entries.map(entry => [entry.name, entry]));
	const slots = Object.freeze(entries.map(entry => Object.freeze({
		address: memoryAddress(entry.slotOffset),
		cells: entry.cells,
		name: entry.name,
		offset: entry.slotOffset
	})));
	return Object.freeze({
		address(name) {
			return memoryAddress(entryFor(byName, name).slotOffset);
		},
		/**
		 * Address of element/field 0: the lowest address of the variable's
		 * range. Identical to address() for scalars.
		 */
		baseAddress(name) {
			return memoryAddress(entryFor(byName, name).slotOffset
				+ (entryFor(byName, name).cells - 1) * CELL_BYTES);
		},
		/** Numeric RBP-relative offset of the aggregate base (element 0). */
		baseOffset(name) {
			const entry = entryFor(byName, name);
			return entry.slotOffset + (entry.cells - 1) * CELL_BYTES;
		},
		cellCount(name) {
			return entryFor(byName, name).cells;
		},
		frameSize: alignUp(totalCells * CELL_BYTES, 16),
		has(name) {
			return byName.has(String(name));
		},
		parameters: Object.freeze((functionNode.parameters || []).map(parameter => {
			const entry = entryFor(byName, parameter.name);
			return Object.freeze({
				address: memoryAddress(entry.slotOffset),
				name: parameter.name,
				offset: entry.slotOffset
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
		addUnique(entries, node.name, node.valueType, layout.cellCount(node.valueType));
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

function addUnique(entries, name, valueType, cells) {
	const text = String(name);
	if (entries.some(entry => entry.name === text)) {
		throw portableCError(
			"PORTABLE_C_SYMBOL_DUPLICATE",
			`Portable C v2 does not support shadowed symbol '${text}'`
		);
	}
	if (!Number.isSafeInteger(cells) || cells < 1) {
		throw portableCError(
			"PORTABLE_C_TYPE_UNSUPPORTED",
			`Portable C cannot allocate storage for '${text}'`
		);
	}
	entries.push({ cells, name: text, slotOffset: 0, valueType });
}

function assertScalarType(valueType, name) {
	if (!["integer", "pointer"].includes(valueType?.kind)) {
		throw portableCError(
			"PORTABLE_C_TYPE_UNSUPPORTED",
			`Portable C v2 requires integer or pointer storage for '${name}'`
		);
	}
}

function memoryAddress(offset) {
	return `QWORD PTR [RBP-${offset}]`;
}
