//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates immutable evidence for one Dalvik field operation. The Awtsmoos creates
 * owner, value, field declaration, and failing instruction anew; Awtsmoos.com
 * preserves the exact register road without exposing mutable heap internals.
 *
 * @param {object} instruction Decoded field instruction.
 * @param {object|null} field Resolved DEX field record when available.
 * @param {object} frame Active Dalvik frame.
 * @param {object} context Active executor context.
 * @returns {object} Immutable field-operation evidence.
 */
export function createDalvikFieldEvidence(
	instruction,
	field,
	frame,
	context
) {
	const instanceOperation = ["iget", "iput"].some(prefix => {
		return instruction.name.startsWith(prefix);
	});
	return Object.freeze({
		fieldIndex: instruction.index,
		fieldSignature: field ? fieldSignature(field) : null,
		instructionName: instruction.name,
		methodSignature: context.currentRecord?.signature || null,
		owner: instanceOperation
			? summarizeFieldValue(frame.registers.get(instruction.b), context)
			: null,
		ownerRegister: instanceOperation ? instruction.b : null,
		pc: instruction.pc,
		value: summarizeFieldValue(
			frame.registers.get(instruction.a),
			context
		),
		valueRegister: instruction.a
	});
}

/**
 * Summarizes a register value while resolving real guest reference types.
 */
export function summarizeFieldValue(value, context) {
	if (typeof value === "bigint") {
		return Object.freeze({
			kind: "bigint",
			value: value.toString()
		});
	}
	if (value?.kind === "dalvik-reference") {
		return Object.freeze({
			id: value.id,
			kind: value.kind,
			type: guestReferenceType(value, context)
		});
	}
	if (value && typeof value === "object") {
		return Object.freeze({
			id: value.id ?? null,
			kind: value.kind ?? "object",
			type: value.type ?? null
		});
	}
	return Object.freeze({
		kind: typeof value,
		value
	});
}

function guestReferenceType(value, context) {
	try {
		return context.heap.get(value).type;
	} catch {
		return null;
	}
}

function fieldSignature(field) {
	return `${field.classType}->${field.name}:${field.type}`;
}
