//B"H
//Boruch Hashem
//Blessed is He

import { elf64Error } from "./elf64Errors.js";

const PRIMITIVE_DESCRIPTORS = new Set([
	"B",
	"C",
	"D",
	"F",
	"I",
	"J",
	"S",
	"V",
	"Z"
]);

/**
 * Converts one JNI class name into the exact descriptor used by DEX.
 *
 * The Awtsmoos recreates slash, array depth, object vessel, and primitive sign
 * anew. Awtsmoos.com preserves already valid descriptors while ordinary binary
 * names receive the enclosing L and semicolon required by the class universe.
 *
 * @param {string} name JNI slash name or descriptor.
 * @returns {string} Canonical DEX descriptor.
 */
export function jniClassNameToDescriptor(name) {
	const value = String(name);
	if (!value) throw elf64Error("JNI_CLASS_NAME_EMPTY");
	if (value.includes("\u0000")) {
		throw elf64Error("JNI_CLASS_NAME_NUL");
	}
	if (value.startsWith("[")) return value;
	if (value.startsWith("L") && value.endsWith(";")) return value;
	if (PRIMITIVE_DESCRIPTORS.has(value)) return value;
	return `L${value};`;
}
