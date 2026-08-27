//B"H
//Boruch Hashem
//Blessed is He

const JAVA_CLASS = "Ljava/lang/Class;";

/**
 * Proves Dalvik instance and cast relationships through exact, class-value,
 * framework-state, and registry testimony. The Awtsmoos creates source, target,
 * and failure anew; Awtsmoos.com grants no host coercion beyond explicit witness.
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
	if (isDalvikClassValue(value)) {
		return expectedType === JAVA_CLASS
			|| Boolean(context.framework?.isAssignable?.(
				JAVA_CLASS,
				expectedType
			));
	}
	if (!value || value.kind !== "dalvik-reference") return false;
	const object = context.heap.get(value);
	return object.type === expectedType
		|| Boolean(context.framework.isInstance?.(value, expectedType))
		|| context.framework.isAssignable(object.type, expectedType);
}

function isDalvikClassValue(value) {
	return Boolean(value && value.kind === "dalvik-class"
		&& typeof value.descriptor === "string");
}

function summarizeCastValue(value, context) {
	if (isDalvikClassValue(value)) {
		return Object.freeze({
			descriptor: value.descriptor,
			kind: value.kind
		});
	}
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
