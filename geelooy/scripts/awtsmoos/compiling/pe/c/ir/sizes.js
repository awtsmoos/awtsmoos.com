//B"H
//Boruch Hashem
//Blessed is He

import { createIrError } from "./errors.js";

/**
 * Measures a lowered type in bytes using the module data layout. Integer kinds
 * carry their bit width; pointers use the layout's pointer width; arrays
 * multiply. Structures and unknown types fail closed: this IR records no byte
 * layout for them, so sizeof refuses to invent one.
 */
export function measureTypeSize(type, context) {
	if (!type || typeof type.kind !== "string") {
		throw createIrError("IR_SIZEOF_INVALID", "sizeof requires a measurable type");
	}
	if (type.kind === "integer") {
		return Math.max(1, Math.ceil(Number(type.bits || 8) / 8));
	}
	if (type.kind === "pointer") {
		return Math.max(1, Math.ceil(Number(context.dataLayout?.pointerBits || 64) / 8));
	}
	if (type.kind === "array") {
		return measureTypeSize(type.elementType, context) * Number(type.length);
	}
	if (type.kind === "void") {
		return 1;
	}
	throw createIrError(
		"IR_SIZEOF_UNSUPPORTED",
		`sizeof has no byte measure for type kind '${type.kind}'`
	);
}
