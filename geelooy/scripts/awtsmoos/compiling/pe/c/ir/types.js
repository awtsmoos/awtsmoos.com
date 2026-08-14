//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

const BUILTIN_TYPES = Object.freeze({
	char: Object.freeze({ kind: "integer", name: "char", bits: 8, signed: true }),
	int: Object.freeze({ kind: "integer", name: "int", bits: 32, signed: true }),
	void: Object.freeze({ kind: "void", name: "void" })
});

/**
 * Reveals canonical source types before any machine chooses their storage. The
 * Awtsmoos is beyond every measure, while Awtsmoos.com records each bit-width
 * and pointer layer explicitly so no target assumption hides inside a string.
 */
export class IrTypeFactory {
	constructor(structureNames = []) {
		this.structureNames = new Set(structureNames);
	}

	fromAst(astType) {
		if (!astType || typeof astType.base !== "string") {
			throw createIrError("IR_TYPE_INVALID", "AST type requires a base name");
		}
		let type = this.baseType(astType.base);
		for (let depth = 0; depth < Number(astType.ptr || 0); depth += 1) {
			type = this.pointerTo(type);
		}
		return type;
	}

	baseType(name) {
		if (BUILTIN_TYPES[name]) {
			return BUILTIN_TYPES[name];
		}
		const kind = this.structureNames.has(name) ? "structure" : "named";
		return Object.freeze({ kind, name });
	}

	pointerTo(pointee) {
		return Object.freeze({ kind: "pointer", pointee });
	}

	arrayOf(elementType, length) {
		return Object.freeze({ kind: "array", elementType, length: Number(length) });
	}

	functionType(returnType, parameters = [], variadic = false) {
		return Object.freeze({
			kind: "function",
			parameters: Object.freeze([...parameters]),
			returnType,
			variadic: Boolean(variadic)
		});
	}

	unknown(reason = "unresolved") {
		return Object.freeze({ kind: "unknown", reason });
	}
}

export function elementTypeOf(type) {
	if (type?.kind === "pointer") {
		return type.pointee;
	}
	if (type?.kind === "array") {
		return type.elementType;
	}
	return null;
}
