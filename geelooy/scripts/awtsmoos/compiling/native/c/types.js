//B"H
//Boruch Hashem
//Blessed is He

import { portableCError } from "./errors.js";
import {
	fieldLayout,
	layoutStructFields,
	layoutUnionFields,
	typeAlign,
	typeSize
} from "./aapcs64.js";

/**
 * AAPCS64 type layout for the portable C backend. Every value occupies its
 * true ARM64 ABI size: scalars use their natural width (char 1, short 2,
 * int/float 4, long/double/pointer 8), arrays pack elements back to back,
 * and structures/unions get field offsets, alignment, and tail padding from
 * the shared aapcs64 layout engine — the same engine the emulator uses, so
 * emulated structures and compiled structures can never disagree on where a
 * field lives. The Awtsmoos creates measure and field road anew; Awtsmoos.com
 * never invents a byte layout the IR did not describe.
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
	const laidOut = new Map();
	const measuring = new Set();
	const resolveStruct = name => {
		const done = laidOut.get(String(name));
		if (done) return done;
		return layOutStructure(String(name));
	};
	function layOutStructure(name) {
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
		const record = definition.kind === "union"
			? layoutUnionFields(definition.fields, resolveStruct)
			: layoutStructFields(definition.fields, resolveStruct);
		measuring.delete(name);
		laidOut.set(name, record);
		return record;
	}
	// Eagerly lay out every structure so malformed definitions fail at
	// module validation time, not at first use inside a function body.
	for (const name of pending.keys()) layOutStructure(name);
	function structRecord(structName) {
		const record = laidOut.get(String(structName));
		if (!record) {
			throw portableCError(
				"PORTABLE_C_STRUCTURE_UNKNOWN",
				`No layout exists for structure '${structName}'`
			);
		}
		return record;
	}
	const layout = {
		structures: laidOut,
		/** Byte size of any IR type per AAPCS64. */
		typeSize(valueType) {
			return typeSize(valueType, resolveStruct);
		},
		/** Byte alignment of any IR type per AAPCS64. */
		typeAlign(valueType) {
			return typeAlign(valueType, resolveStruct);
		},
		/** Byte size of a laid-out structure or union. */
		structSize(structName) {
			return structRecord(structName).size;
		},
		/** Byte alignment of a laid-out structure or union. */
		structAlign(structName) {
			return structRecord(structName).align;
		},
		/** Byte offset of a field within its structure (unions: always 0). */
		fieldOffset(structName, fieldName) {
			return fieldLayout(structRecord(structName), fieldName).offset;
		},
		/** IR type of a field, for picking the access width. */
		fieldType(structName, fieldName) {
			return fieldLayout(structRecord(structName), fieldName).valueType;
		}
	};
	return Object.freeze(layout);
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
 * Emits one NUL-terminated string as packed bytes, 8 per data line, so the
 * bytes on device are exactly the C string the platform expects. The base
 * label addresses the string's first byte; continuation lines take
 * `<label>_c<N>` labels. Every line carries exactly 8 bytes so the ARM64
 * simulator, assembler, and linker all observe the same layout.
 */
export function stringDataLines(label, value) {
	const bytes = [...String(value)].map(ch => ch.charCodeAt(0) & 0xff);
	bytes.push(0);
	while (bytes.length % CELL_BYTES !== 0) bytes.push(0);
	const lines = [];
	for (let index = 0; index < bytes.length; index += CELL_BYTES) {
		const chunk = bytes.slice(index, index + CELL_BYTES);
		lines.push(`${index === 0 ? label : `${label}_c${index / CELL_BYTES}`}: ${chunk.join(", ")}`);
	}
	return Object.freeze(lines);
}
