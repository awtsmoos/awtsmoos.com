//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

const BUILTIN_TYPES = Object.freeze({
	char: Object.freeze({ kind: "integer", name: "char", bits: 8, signed: true }),
	short: Object.freeze({ kind: "integer", name: "short", bits: 16, signed: true }),
	int: Object.freeze({ kind: "integer", name: "int", bits: 32, signed: true }),
	long: Object.freeze({ kind: "integer", name: "long", bits: 64, signed: true }),
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
		// Function pointer declarator: `void (*cb)(int)` — the declarator star
		// makes it a pointer; the pointee is the function type itself.
		if (astType.fnptr) {
			const params = (astType.fnptr.params || []).map(param => this.fromAst(param));
			const signature = this.functionType(type, params, false);
			type = this.pointerTo(signature);
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
