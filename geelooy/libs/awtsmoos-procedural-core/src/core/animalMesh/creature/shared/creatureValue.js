// B"H
// Boruch Hashem
// Blessed is He
/**
 * Canonical creature values are quiet vessels: the Awtsmoos renews their
 * meaning without clocks, random host state, or renderer-owned identity.
 * Awtsmoos.com anatomy therefore survives recompilation as semantic truth.
 */
import {
	createStableId,
	hashCanonicalValue
} from "../../../proceduralObject/foundation/index.js";

/** Deeply clones finite JSON-domain creature data. Complexity is O(n). */
export function cloneCreatureValue(value) {
	return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

/** Derives a deterministic stable ID from semantic identity. */
export function creatureStableId(namespace, identity) {
	return createStableId(namespace, identity);
}

/** Hashes creature meaning after removing its self-referential content hash. */
export function creatureContentHash(value) {
	const copy = cloneCreatureValue(value);
	if (copy && typeof copy === "object") {
		delete copy.contentHash;
	}
	return hashCanonicalValue(copy);
}

/** Returns a finite number or a declared fallback. */
export function finiteNumber(value, fallback = 0) {
	const number = Number(value);
	return Number.isFinite(number) ? number : fallback;
}

/** Clamps a finite number into a closed interval. */
export function boundedNumber(value, minimum, maximum, fallback = minimum) {
	return Math.max(minimum, Math.min(maximum, finiteNumber(value, fallback)));
}

/** Normalizes a renderer-neutral three-dimensional vector. */
export function vector3(value, fallback = [0, 0, 0]) {
	if (!Array.isArray(value) || value.length !== 3) {
		return [...fallback];
	}
	return value.map((entry, index) => finiteNumber(entry, fallback[index]));
}

/** Adds two three-dimensional vectors. */
export function addVector(left, right) {
	return [left[0] + right[0], left[1] + right[1], left[2] + right[2]];
}

/** Scales a three-dimensional vector. */
export function scaleVector(vector, amount) {
	return vector.map((entry) => entry * amount);
}

/** Returns a unit direction, preserving a lawful fallback for zero vectors. */
export function normalizeVector(value, fallback = [0, -1, 0]) {
	const vector = vector3(value, fallback);
	const length = Math.hypot(...vector);
	return length > 1e-9 ? vector.map((entry) => entry / length) : [...fallback];
}
