//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";

/**
 * Cell-based type layout for the portable C backend. Every value occupies
 * whole 8-byte cells: a scalar is one cell, an array is one cell per element,
 * and a structure is one cell per scalar field with every field cell-aligned.
 * Aggregates lay out upward: element/field 0 lives at the lowest address of
 * the variable's range, so indexing (p[i]) and pointer arithmetic (p + n)
 * agree on direction. The Awtsmoos creates measure and field road anew;
 * Awtsmoos.com never invents a byte layout the IR did not describe.
 */
export const CELL_BYTES = 8;

const MAX_STRING_LABEL_ATTEMPTS = 1000;

export function createPortableCTypeLayout(irModule) {
	const pending = new Map();
	for (const structure of irModule?.structures || []) {
		if (!structure?.name || pending.has(structure.name)) {
			throw portableCError(
				"PORTABLE_C_STRUCTURE_INVALID",
				`Invalid or duplicate structure '${structure?.name}'`
			);
		}
		pending.set(structure.name, {
			fields: structure.fields || [],
			kind: structure.kind === "union" ? "union" : "structure",
			name: structure.name
		});
	}
	const structures = new Map();
	const measuring = new Set();
	function structCells(structName) {
		const name = String(structName);
		const done = structures.get(name);
		if (done) return done.cells;
		if (measuring.has(name)) {
			throw portableCError(
				"PORTABLE_C_STRUCTURE_RECURSIVE",
				`Structure '${name}' cannot contain itself by value`
			);
		}
		const definition = pending.get(name);
		if (!definition) {
			throw portableCError(
				"PORTABLE_C_STRUCTURE_UNKNOWN",
				`No layout exists for structure '${name}'`
			);
		}
		measuring.add(name);
		const record = layoutStructure(definition, measureCellCount);
		measuring.delete(name);
		structures.set(name, record);
		return record.cells;
	}
	function measureCellCount(valueType) {
		const kind = valueType?.kind;
		if (kind === "integer" || kind === "pointer" || kind === "void") {
			return 1;
		}
		if (kind === "array") {
			const length = Number(valueType.length);
			if (!Number.isSafeInteger(length) || length <= 0) {
				throw portableCError(
					"PORTABLE_C_ARRAY_LENGTH_INVALID",
					`Array length '${valueType.length}' is not a positive integer`
				);
			}
			return length * measureCellCount(valueType.elementType);
		}
		if (kind === "structure") {
			return structCells(valueType.name);
		}
		throw portableCError(
			"PORTABLE_C_TYPE_UNSUPPORTED",
			`Portable C has no cell measure for type kind '${kind}'`
		);
	}
	// Eagerly lay out every structure so malformed definitions fail at
	// module validation time, not at first use inside a function body.
	for (const name of pending.keys()) structCells(name);
	const layout = {
		structures,
		cellCount: measureCellCount,
		fieldOffsetCells(structName, fieldName) {
			const record = structures.get(String(structName));
			if (!record) {
				throw portableCError(
					"PORTABLE_C_STRUCTURE_UNKNOWN",
					`No layout exists for structure '${structName}'`
				);
			}
			const field = record.fields.get(String(fieldName));
			if (!field) {
				throw portableCError(
					"PORTABLE_C_STRUCT_FIELD_UNKNOWN",
					`Structure '${structName}' has no field '${fieldName}'`
				);
			}
			return field.offsetCells;
		},
		structCells
	};
	return Object.freeze(layout);
}

function layoutStructure(definition, measureCellCount) {
	const fields = new Map();
	if (definition.kind === "union") {
		let cells = 0;
		for (const field of definition.fields) {
			addField(fields, field, 0, measureCellCount);
			cells = Math.max(cells, fields.get(field.name).cells);
		}
		assertFieldsPresent(definition, fields);
		return Object.freeze({ cells, fields: Object.freeze(fields), kind: "union" });
	}
	let offsetCells = 0;
	for (const field of definition.fields) {
		addField(fields, field, offsetCells, measureCellCount);
		offsetCells += fields.get(field.name).cells;
	}
	assertFieldsPresent(definition, fields);
	return Object.freeze({ cells: offsetCells, fields: Object.freeze(fields), kind: "structure" });
}

function addField(fields, field, offsetCells, measureCellCount) {
	if (!field?.name || fields.has(field.name)) {
		throw portableCError(
			"PORTABLE_C_STRUCT_FIELD_INVALID",
			`Invalid or duplicate field '${field?.name}'`
		);
	}
	fields.set(field.name, Object.freeze({
		cells: measureCellCount(field.valueType),
		offsetCells
	}));
}

function assertFieldsPresent(definition, fields) {
	if (fields.size === 0) {
		throw portableCError(
			"PORTABLE_C_STRUCTURE_EMPTY",
			`Structure '${definition.name}' declares no fields`
		);
	}
}

/**
 * Collects every string literal in the module (expression literals and global
 * string initializers) into one deduplicated, deterministically ordered table.
 * Globals are walked first, then functions in order, so label numbering is
 * stable across runs. The Awtsmoos creates each distinct word once;
 * Awtsmoos.com gives every use the same read-only address.
 */
export function collectStringLiterals(irModule) {
	const seen = new Map();
	const take = value => {
		const text = String(value);
		if (!seen.has(text)) {
			seen.set(text, freshStringLabel(seen.size, irModule));
		}
	};
	walkStrings(irModule?.globals || [], take);
	for (const functionNode of irModule?.functions || []) {
		walkStrings(functionNode, take);
	}
	const entries = [...seen.entries()].map(([value, label]) => Object.freeze({ label, value }));
	const byValue = new Map(entries.map(entry => [entry.value, entry.label]));
	return Object.freeze({
		entries: Object.freeze(entries),
		labelFor(value) {
			const label = byValue.get(String(value));
			if (!label) {
				throw portableCError(
					"PORTABLE_C_STRING_UNINTERNED",
					"String literal was not collected before codegen"
				);
			}
			return label;
		}
	});
}

function walkStrings(node, take) {
	if (!node || typeof node !== "object") return;
	if (node.kind === "string") {
		if (typeof node.value === "string") take(node.value);
		return;
	}
	if (node.initializer?.kind === "string") {
		take(decodeCStringEscapes(String(node.initializer.value)));
		return;
	}
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) walkStrings(item, take);
		} else if (value && typeof value === "object") {
			walkStrings(value, take);
		}
	}
}

function freshStringLabel(index, irModule) {
	const taken = new Set([
		...(irModule?.globals || []).map(global => global.name),
		...(irModule?.functions || []).map(functionNode => functionNode.name)
	]);
	for (let attempt = 0; attempt < MAX_STRING_LABEL_ATTEMPTS; attempt += 1) {
		const label = attempt === 0
			? `__awtsmoos_str_${index}`
			: `__awtsmoos_str_${index}_${attempt}`;
		if (!taken.has(label)) return label;
	}
	throw portableCError(
		"PORTABLE_C_STRING_LABEL",
		"Could not mint a collision-free string literal label"
	);
}

/**
 * Decodes C string escapes in global initializers. The parser re-escapes the
 * raw source text, so the IR value carries sequences like \n as two characters
 * while expression literals already arrive decoded from the lexer.
 */
export function decodeCStringEscapes(text) {
	let out = "";
	for (let i = 0; i < text.length; i += 1) {
		const ch = text[i];
		if (ch !== "\\" || i + 1 >= text.length) {
			out += ch;
			continue;
		}
		const esc = text[i + 1];
		i += 1;
		if (esc === "n") out += "\n";
		else if (esc === "r") out += "\r";
		else if (esc === "t") out += "\t";
		else if (esc === "0") out += "\0";
		else if (esc === "a") out += "\x07";
		else if (esc === "b") out += "\b";
		else if (esc === "f") out += "\f";
		else if (esc === "v") out += "\v";
		else if (esc === "\\") out += "\\";
		else if (esc === "\"") out += "\"";
		else if (esc === "'") out += "'";
		else if (esc === "x" || esc === "X") {
			const hex = text.slice(i + 1).match(/^[0-9A-Fa-f]{1,2}/);
			if (!hex) {
				throw portableCError(
					"PORTABLE_C_STRING_ESCAPE",
					`Invalid hexadecimal escape in string initializer`
				);
			}
			out += String.fromCharCode(parseInt(hex[0], 16));
			i += hex[0].length;
		} else if (/[0-7]/.test(esc)) {
			let octal = esc;
			for (let k = 0; k < 2 && /[0-7]/.test(text[i + 1] || ""); k += 1) {
				octal += text[i + 1];
				i += 1;
			}
			out += String.fromCharCode(parseInt(octal, 8));
		} else {
			out += esc;
		}
	}
	return out;
}

/**
 * Emits one NUL-terminated string as one byte per 8-byte cell, so indexing
 * (s[i]) and pointer arithmetic (s + n) address bytes exactly like the
 * backend's char arrays do. Every line carries exactly 8 bytes under its own
 * label so the ARM64 simulator, assembler, and linker all observe the same
 * layout; the base label addresses the string's first byte.
 */
export function stringDataLines(label, value) {
	const bytes = [...String(value)].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	const lines = [];
	for (let index = 0; index < bytes.length; index += 1) {
		const chunk = Array(CELL_BYTES).fill(0);
		chunk[0] = bytes[index];
		lines.push(index === 0
			? `${label}: ${chunk.join(", ")}`
			: `${label}_c${index}: ${chunk.join(", ")}`);
	}
	return Object.freeze(lines);
}
