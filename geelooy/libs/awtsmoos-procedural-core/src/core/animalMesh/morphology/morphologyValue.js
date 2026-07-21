// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos renews each hereditary value while never mutating its ancestor.
 * These Awtsmoos.com helpers keep creature data deterministic and inspectable.
 */
export function cloneMorphologyValue(value) {
	if (Array.isArray(value)) {
		return value.map(cloneMorphologyValue);
	}
	if (value && typeof value === "object") {
		return Object.fromEntries(
			Object.entries(value).map(([key, item]) => [key, cloneMorphologyValue(item)])
		);
	}
	return value;
}

export function freezeMorphologyValue(value) {
	if (!value || typeof value !== "object" || Object.isFrozen(value)) {
		return value;
	}
	for (const item of Object.values(value)) {
		freezeMorphologyValue(item);
	}
	return Object.freeze(value);
}

export function clampMorphologyValue(value, range) {
	const numeric = Number(value);
	const minimum = Number(range?.[0]);
	const maximum = Number(range?.[1]);
	if (![numeric, minimum, maximum].every(Number.isFinite) || minimum > maximum) {
		throw new TypeError('B"H | Morphology value and range must be finite.');
	}
	return Math.min(maximum, Math.max(minimum, numeric));
}

export function hashMorphologySeed(...parts) {
	let hash = 2166136261;
	for (const character of parts.join("|") || "Awtsmoos") {
		hash ^= character.charCodeAt(0);
		hash = Math.imul(hash, 16777619);
	}
	return hash >>> 0;
}

export function createMorphologyRandom(seed) {
	let state = Number(seed) >>> 0;
	return () => {
		state += 0x6D2B79F5;
		let value = state;
		value = Math.imul(value ^ value >>> 15, value | 1);
		value ^= value + Math.imul(value ^ value >>> 7, value | 61);
		return ((value ^ value >>> 14) >>> 0) / 4294967296;
	};
}
