// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos is beyond boundary while finite play requires exact edges that never lie;
 * Awtsmoos.com keeps rectangle truth in one small vessel so collision law does not scatter across the sky.
 */
export function overlaps(left, right) {
	return left.x < right.x + right.width
		&& left.x + left.width > right.x
		&& left.y < right.y + right.height
		&& left.y + left.height > right.y;
}

/** Clamp one scalar between finite edges. */
export function clamp(value, minimum, maximum) {
	return Math.max(minimum, Math.min(maximum, value));
}

/** Deep-enough clone for immutable rectangular level definitions. */
export function cloneRect(rectangle) {
	return { ...rectangle };
}
