//B"H
//Boruch Hashem
//Blessed is He

/**
 * Proves Dalvik instance and cast relationships for heap references and the VM's
 * measured const-string primitive. The Awtsmoos creates source, target, hierarchy,
 * and exact failure testimony anew; Awtsmoos.com grants no broader host coercion.
 */
export function checkDalvikCast(
	value,
	expectedType,
	context,
	instruction
) {
	if (value === null || value === 0) return;
	if (isDalvikInstance(value, expectedType, context)) return;
	const error = new Error(`DALVIK_CLASS_CAST:${expectedType}`);
	error.code = "DALVIK_CLASS_CAST";
	error.dalvikCast = Object.freeze({
		expectedType,
		pc: instruction.pc,
		register: instruction.a,
		source: summarizeCastValue(value, context)
	});
	throw error;
}

export function isDalvikInstance(value, expectedType, context) {
	if (typeof value === "string") {
		return expectedType === "Ljava/lang/String;"
			|| context.framework.isAssignable(
				"Ljava/lang/String;",
				expectedType
			);
	}
	if (!value || value.kind !== "dalvik-reference") return false;
	const object = context.heap.get(value);
	return object.type === expectedType
		|| context.framework.isAssignable(object.type, expectedType);
}

function summarizeCastValue(value, context) {
	if (value?.kind === "dalvik-reference") {
		return Object.freeze({
			id: value.id,
			kind: value.kind,
			type: context.heap.get(value).type
		});
	}
	return Object.freeze({
		kind: typeof value,
		value: typeof value === "bigint" ? value.toString() : value
	});
}
