// B"H

import {
	CANONICAL_NUMBER_TAGS,
	CANONICAL_VALUE_TAGS
} from "./canonicalValueTags.js";
import { encodeBinaryValue } from "./encodeBinaryValue.js";

const DEFAULT_MAX_DEPTH = 256;

function freezeTree(value) {
	if (value === null || typeof value !== "object" || Object.isFrozen(value)) {
		return value;
	}
	for (const child of Object.values(value)) {
		freezeTree(child);
	}
	return Object.freeze(value);
}

function normalizeNumber(value) {
	if (Number.isNaN(value)) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NAN };
	}
	if (value === Infinity) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.POSITIVE_INFINITY };
	}
	if (value === -Infinity) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NEGATIVE_INFINITY };
	}
	if (Object.is(value, -0)) {
		return { type: CANONICAL_VALUE_TAGS.NUMBER, value: CANONICAL_NUMBER_TAGS.NEGATIVE_ZERO };
	}
	return value;
}

function normalizeObject(value, state, depth) {
	const binaryValue = encodeBinaryValue(value);
	if (binaryValue) {
		return binaryValue;
	}
	const prototype = Object.getPrototypeOf(value);
	if (prototype !== Object.prototype && prototype !== null) {
		throw new TypeError(`Unsupported canonical object: ${value.constructor?.name ?? "unknown"}`);
	}
	if (Reflect.ownKeys(value).some(key => typeof key === "symbol")) {
		throw new TypeError("Canonical objects cannot contain symbol keys.");
	}
	const entries = Object.keys(value).sort().map(key => {
		const descriptor = Object.getOwnPropertyDescriptor(value, key);
		if (!descriptor || descriptor.get || descriptor.set) {
			throw new TypeError(`Canonical property "${key}" must be a data property.`);
		}
		return [key, normalizeValue(descriptor.value, state, depth + 1)];
	});
	return { type: CANONICAL_VALUE_TAGS.OBJECT, entries };
}

function normalizeArray(value, state, depth) {
	const items = [];
	for (let index = 0; index < value.length; index += 1) {
		items.push(
			Object.hasOwn(value, index)
				? normalizeValue(value[index], state, depth + 1)
				: { type: CANONICAL_VALUE_TAGS.HOLE }
		);
	}
	return { type: CANONICAL_VALUE_TAGS.ARRAY, items };
}

function normalizeValue(value, state, depth) {
	if (depth > state.maxDepth) {
		throw new RangeError(`Canonical value exceeds maximum depth ${state.maxDepth}.`);
	}
	if (value === null || typeof value === "string" || typeof value === "boolean") {
		return value;
	}
	if (typeof value === "number") {
		return normalizeNumber(value);
	}
	if (typeof value === "bigint") {
		return { type: CANONICAL_VALUE_TAGS.BIGINT, value: value.toString() };
	}
	if (typeof value === "undefined") {
		return { type: CANONICAL_VALUE_TAGS.UNDEFINED };
	}
	if (typeof value !== "object") {
		throw new TypeError(`Unsupported canonical value type: ${typeof value}`);
	}
	if (state.ancestors.has(value)) {
		throw new TypeError("Canonical values cannot contain cycles.");
	}
	state.ancestors.add(value);
	try {
		return Array.isArray(value)
			? normalizeArray(value, state, depth)
			: normalizeObject(value, state, depth);
	} finally {
		state.ancestors.delete(value);
	}
}

/**
 * Produces an immutable, collision-resistant structured representation.
 *
 * Beneath changing insertion order, the same inner form is revealed; yet
 * every meaningful distinction remains clothed in an explicit stable tag.
 */
export function normalizeCanonicalValue(value, options = {}) {
	const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
	if (!Number.isInteger(maxDepth) || maxDepth < 0) {
		throw new RangeError("Canonical maxDepth must be a non-negative integer.");
	}
	return freezeTree(normalizeValue(value, { ancestors: new Set(), maxDepth }, 0));
}
