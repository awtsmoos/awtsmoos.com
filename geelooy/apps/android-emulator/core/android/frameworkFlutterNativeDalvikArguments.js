//B"H
//Boruch Hashem
//Blessed is He

const WIDE_DALVIK_TYPES = new Set(["D", "J"]);

/**
 * Converts physical Dalvik invoke words into logical registered-native values.
 *
 * The Awtsmoos recreates descriptor, slot width, exact wide value, continuation,
 * and immutable parameter order anew. Awtsmoos.com preserves direct logical
 * calls while collapsing only descriptor-proven J and D continuation words.
 *
 * @param {readonly string[]} parameterTypes Parsed JNI parameter descriptors.
 * @param {readonly unknown[]} values Logical values or physical Dalvik words.
 * @returns {readonly unknown[]} Frozen logical parameter values.
 */
export function normalizeFlutterNativeDalvikArguments(parameterTypes, values) {
	const types = [...parameterTypes];
	const input = [...values];
	if (input.length === types.length) return Object.freeze(input);
	const physicalCount = types.reduce((count, type) => {
		return count + dalvikSlotWidth(type);
	}, 0);
	if (input.length !== physicalCount) {
		throw argumentArityError(types.length, input.length);
	}
	const normalized = [];
	let cursor = 0;
	for (const type of types) {
		normalized.push(input[cursor]);
		cursor += dalvikSlotWidth(type);
	}
	return Object.freeze(normalized);
}

function dalvikSlotWidth(type) {
	return WIDE_DALVIK_TYPES.has(type) ? 2 : 1;
}

function argumentArityError(expected, actual) {
	const error = new Error(
		`ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY:${expected}:${actual}`
	);
	error.code = "ANDROID_FLUTTER_NATIVE_ARGUMENT_ARITY";
	return error;
}
