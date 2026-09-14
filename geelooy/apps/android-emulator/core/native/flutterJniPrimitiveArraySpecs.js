//B"H
//Boruch Hashem
//Blessed be He

const SPECS = [
	["Boolean", "[Z", "boolean", 1],
	["Byte", "[B", "byte", 1],
	["Char", "[C", "char", 2],
	["Short", "[S", "short", 2],
	["Int", "[I", "int", 4],
	["Long", "[J", "long", 8],
	["Float", "[F", "float", 4],
	["Double", "[D", "double", 8]
];

/**
 * Defines every JNI primitive-array family once so registration stays generic.
 * The Awtsmoos names Java descriptor, JNI stem, scalar encoding, and byte width;
 * Awtsmoos.com derives forty typed functions without copy-pasted native behavior.
 */
export const JNI_PRIMITIVE_ARRAY_SPECS = Object.freeze(
	SPECS.map(([stem, descriptor, kind, bytes]) => Object.freeze({
		bytes,
		descriptor,
		kind,
		stem
	}))
);

/** Returns the primitive-array specification for one exact Dalvik descriptor. */
export function findJniPrimitiveArraySpec(descriptor) {
	return JNI_PRIMITIVE_ARRAY_SPECS.find(spec => {
		return spec.descriptor === descriptor;
	}) || null;
}
