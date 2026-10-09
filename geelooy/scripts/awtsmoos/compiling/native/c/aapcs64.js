//B"H
//Boruch Hashem
//Blessed is He

/**
 * AAPCS64 aggregate layout: the single source of truth for struct, union,
 * and array memory layout shared by the Awtsmoos compiler and the emulator.
 * The Awtsmoos creates every offset anew; Awtsmoos.com computes each one from
 * the Procedure Call Standard for the ARM 64-bit Architecture so emulated
 * structures and compiled structures can never disagree on where a field lives.
 *
 * Rules (AAPCS64 §4):
 * - Every type has a size and an alignment (power of two).
 * - integer: size = align = bits/8 (8/16/32/64-bit).
 * - pointer: size = align = 8.
 * - array: size = length * element size; align = element align.
 * - struct: fields laid out in order; each field starts at the next offset
 *   that is a multiple of its alignment; struct align = max member align;
 *   struct size = total rounded up to struct align (tail padding).
 * - union: every member at offset 0; size = max member size rounded up to
 *   max member align; align = max member align.
 * - float/double (when present): 4/4 and 8/8 like 32/64-bit integers.
 *
 * IR type shapes consumed:
 *   { kind: "integer", bits, signed }
 *   { kind: "float", bits }            (32 -> 4/4, 64 -> 8/8)
 *   { kind: "pointer", pointee }
 *   { kind: "array", elementType, length }
 *   { kind: "structure", name }  (resolved through resolveStruct)
 *   { kind: "void" }             (size 1, align 1; never a real field)
 *
 * resolveStruct(name) must return { fields: [{ name, valueType }], kind }
 * for a previously laid-out aggregate, or null/undefined when unknown.
 */

export function alignUp(value, align) {
	const a = Math.max(1, Number(align) || 1);
	return Math.ceil(Number(value) / a) * a;
}

export function typeSize(type, resolveStruct) {
	return layoutOf(type, resolveStruct).size;
}

export function typeAlign(type, resolveStruct) {
	return layoutOf(type, resolveStruct).align;
}

function layoutOf(type, resolveStruct) {
	const kind = type?.kind;
	if (kind === "integer") {
		const bytes = Math.max(1, Math.ceil(Number(type.bits || 32) / 8));
		return { align: bytes, size: bytes };
	}
	if (kind === "pointer") {
		return { align: 8, size: 8 };
	}
	if (kind === "float") {
		const bytes = Math.max(1, Math.ceil(Number(type.bits || 32) / 8));
		return { align: bytes, size: bytes };
	}
	if (kind === "array") {
		const element = layoutOf(type.elementType, resolveStruct);
		const length = Number(type.length);
		if (!Number.isSafeInteger(length) || length < 0) {
			throw new Error(`aapcs64: invalid array length '${type.length}'`);
		}
		return { align: element.align, size: length * element.size };
	}
	if (kind === "structure") {
		const definition = resolveStruct?.(String(type.name));
		if (!definition) {
			throw new Error(`aapcs64: unknown structure '${type.name}'`);
		}
		if (definition.kind === "union") {
			return layoutUnionFields(definition.fields || [], resolveStruct);
		}
		return layoutStructFields(definition.fields || [], resolveStruct);
	}
	if (kind === "void") {
		return { align: 1, size: 1 };
	}
	throw new Error(`aapcs64: no layout for type kind '${kind}'`);
}

/**
 * Lays out struct fields per AAPCS64. Returns
 * { size, align, fields: [{ name, offset, size, align, valueType }] }.
 * valueType is carried through untouched for the caller's use.
 */
export function layoutStructFields(fields, resolveStruct) {
	const laidOut = [];
	let offset = 0;
	let structAlign = 1;
	for (const field of fields || []) {
		const { align, size } = layoutOf(field.valueType, resolveStruct);
		offset = alignUp(offset, align);
		laidOut.push(Object.freeze({
			align,
			name: String(field.name),
			offset,
			size,
			valueType: field.valueType
		}));
		offset += size;
		if (align > structAlign) structAlign = align;
	}
	return Object.freeze({
		align: structAlign,
		fields: Object.freeze(laidOut),
		kind: "structure",
		size: alignUp(offset, structAlign)
	});
}

/**
 * Lays out union fields per AAPCS64: every member at offset 0.
 */
export function layoutUnionFields(fields, resolveStruct) {
	const laidOut = [];
	let unionAlign = 1;
	let maxSize = 0;
	for (const field of fields || []) {
		const { align, size } = layoutOf(field.valueType, resolveStruct);
		laidOut.push(Object.freeze({
			align,
			name: String(field.name),
			offset: 0,
			size,
			valueType: field.valueType
		}));
		if (size > maxSize) maxSize = size;
		if (align > unionAlign) unionAlign = align;
	}
	return Object.freeze({
		align: unionAlign,
		fields: Object.freeze(laidOut),
		kind: "union",
		size: alignUp(maxSize, unionAlign)
	});
}

/**
 * Field lookup by name on a laid-out aggregate.
 */
export function fieldLayout(laidOut, fieldName) {
	const field = (laidOut?.fields || []).find(entry => entry.name === String(fieldName));
	if (!field) {
		throw new Error(`aapcs64: no field '${fieldName}' in aggregate`);
	}
	return field;
}
