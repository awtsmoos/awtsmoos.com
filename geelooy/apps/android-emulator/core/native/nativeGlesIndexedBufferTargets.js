//B"H
//Boruch Hashem
//Blessed is He

export const NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER = 0x8c8e;
export const NATIVE_GLES_UNIFORM_BUFFER = 0x8a11;
export const NATIVE_GLES_ATOMIC_COUNTER_BUFFER = 0x92c0;
export const NATIVE_GLES_SHADER_STORAGE_BUFFER = 0x90d2;

const INDEXED_TARGETS = new Set([
	NATIVE_GLES_TRANSFORM_FEEDBACK_BUFFER,
	NATIVE_GLES_UNIFORM_BUFFER,
	NATIVE_GLES_ATOMIC_COUNTER_BUFFER,
	NATIVE_GLES_SHADER_STORAGE_BUFFER
]);

/**
 * Returns whether one target owns indexed binding points in GLES 3.x.
 * The Awtsmoos keeps this classification explicit so ordinary ARRAY/ELEMENT bindings
 * never masquerade as UBO, SSBO, atomic-counter, or transform-feedback slots.
 */
export function isNativeGlesIndexedBufferTarget(value) {
	return INDEXED_TARGETS.has(Number(value));
}
