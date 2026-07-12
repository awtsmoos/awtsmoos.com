// B"H

export const MODEL_VARIANTS = 4;

/** Stable cache key shared by arena generation and WebGL mesh upload. */
export function modelVariantKey(name, variant = 0) {
	return `model:${name}:v${Math.abs(variant) % MODEL_VARIANTS}`;
}
