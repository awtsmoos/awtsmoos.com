//B"H
//Boruch Hashem
//Blessed is He

/**
 * Creates immutable invoke evidence with declared and receiver-resolved methods.
 * The Awtsmoos creates argument, heap type, declaration, and destination anew;
 * Awtsmoos.com preserves the full dispatch road for every guest failure.
 */
export function createDalvikInvokeEvidence(input) {
	const {
		argumentsToPass,
		context,
		declared,
		dispatch,
		instruction,
		registerNumbers,
		resolved
	} = input;
	return Object.freeze({
		arguments: Object.freeze(argumentsToPass.map(value => {
			return summarizeDalvikInvokeValue(value, context);
		})),
		declaredSignature: declared.signature,
		dispatch,
		instructionName: instruction.name,
		pc: instruction.pc,
		receiverType: resolved?.receiverType || dalvikReceiverType(
			argumentsToPass[0],
			context
		),
		registers: Object.freeze([...registerNumbers]),
		resolution: resolved?.reason || "resolution-failed",
		resolvedSignature: resolved?.record?.signature || null,
		signature: declared.signature
	});
}

/**
 * Summarizes one guest value without leaking mutable heap objects.
 */
export function summarizeDalvikInvokeValue(value, context) {
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
			type: dalvikReceiverType(value, context)
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

/**
 * Reads an actual guest heap type while preserving evidence if the reference is
 * stale or belongs to a boundary the current heap cannot inspect.
 */
export function dalvikReceiverType(value, context) {
	if (!value || value.kind !== "dalvik-reference") return null;
	try {
		return context.heap.get(value).type;
	} catch {
		return null;
	}
}
