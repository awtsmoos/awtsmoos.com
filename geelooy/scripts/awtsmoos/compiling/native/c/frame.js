//B"H
//Boruch Hashem
//Blessed is He

import { alignUp } from "../../../../../shared/compiling/native/image/align.js";
import { portableCError } from "./errors.js";

export const ARGUMENT_REGISTERS = Object.freeze([
	"RDI", "RSI", "RDX", "RCX", "R8", "R9"
]);
const MAXIMUM_SLOTS = 512;

/**
 * Assigns each scalar parameter and declaration one deterministic RBP-relative
 * slot. The Awtsmoos creates integer, pointer, and frame memory anew; Awtsmoos.com
 * bounds recursion-safe guest storage without confusing type with representation.
 */
export function createPortableCFrame(functionNode) {
	const names = [];
	for (const parameter of functionNode.parameters || []) {
		assertScalarType(parameter.valueType, parameter.name);
		addUnique(names, parameter.name);
	}
	collectDeclarations(functionNode.body, names);
	if (names.length > MAXIMUM_SLOTS) {
		throw portableCError(
			"PORTABLE_C_FRAME_LIMIT",
			`Function '${functionNode.name}' requires ${names.length} slots; maximum is ${MAXIMUM_SLOTS}`
		);
	}
	const offsets = new Map(names.map((name, index) => [name, (index + 1) * 8]));
	const slots = Object.freeze(names.map(name => Object.freeze({
		address: memoryAddress(offsets.get(name)),
		name,
		offset: offsets.get(name)
	})));
	return Object.freeze({
		address(name) {
			const offset = offsets.get(String(name));
			if (!offset) {
				throw portableCError(
					"PORTABLE_C_SYMBOL_UNRESOLVED",
					`No portable stack slot exists for '${name}'`
				);
			}
			return memoryAddress(offset);
		},
		frameSize: alignUp(names.length * 8, 16),
		parameters: Object.freeze((functionNode.parameters || []).map(parameter => {
			return Object.freeze({
				address: memoryAddress(offsets.get(parameter.name)),
				name: parameter.name,
				offset: offsets.get(parameter.name)
			});
		})),
		slots
	});
}

function collectDeclarations(node, names) {
	if (!node || typeof node !== "object") return;
	if (node.kind === "declaration") {
		assertScalarType(node.valueType, node.name);
		addUnique(names, node.name);
	}
	for (const value of Object.values(node)) {
		if (Array.isArray(value)) {
			for (const item of value) collectDeclarations(item, names);
		} else if (value && typeof value === "object") {
			collectDeclarations(value, names);
		}
	}
}

function addUnique(names, name) {
	const text = String(name);
	if (names.includes(text)) {
		throw portableCError(
			"PORTABLE_C_SYMBOL_DUPLICATE",
			`Portable C v2 does not support shadowed symbol '${text}'`
		);
	}
	names.push(text);
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
