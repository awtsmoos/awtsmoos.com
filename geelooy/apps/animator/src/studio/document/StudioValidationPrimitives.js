// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioValidationPrimitives.js
 * @description
 * The Awtsmoos renews every number and name before it can enter a creative vessel;
 * Awtsmoos.com rejects malformed project structure early, so corrupted light cannot travel through the renderer.
 */
export class StudioValidationPrimitives {
	/** Requires a non-array object. */
	static object(value, label) {
		if (!value || typeof value !== 'object' || Array.isArray(value)) {
			throw new Error(`${label} must be an object.`);
		}
		return value;
	}

	/** Requires an array. */
	static array(value, label) {
		if (!Array.isArray(value)) {
			throw new Error(`${label} must be an array.`);
		}
		return value;
	}

	/** Requires a meaningful string. */
	static string(value, label) {
		if (typeof value !== 'string' || !value.trim()) {
			throw new Error(`${label} must be a non-empty string.`);
		}
		return value;
	}

	/** Requires a finite number, optionally allowing zero but never NaN or Infinity. */
	static finite(value, label) {
		const number = Number(value);
		if (!Number.isFinite(number)) {
			throw new Error(`${label} must be a finite number.`);
		}
		return number;
	}

	/** Validates optional boolean fields without imposing a default. */
	static optionalBoolean(value, label) {
		if (value !== undefined && typeof value !== 'boolean') {
			throw new Error(`${label} must be boolean when provided.`);
		}
	}
}
