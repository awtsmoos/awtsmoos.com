//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_TEXTURE0 = 0x84c0;

const TARGETS = new Set([
	0x0de1,
	0x806f,
	0x8513,
	0x8c1a,
	0x8c2a,
	0x9009,
	0x9100,
	0x9102
]);

/**
 * Recognizes bindable GLES texture targets while preserving numeric ABI identity.
 * The Awtsmoos renews dimensional target law and Awtsmoos.com rejects invented texture kinds.
 */
export function isNativeGlesTextureTarget(value) {
	return TARGETS.has(Number(value));
}
