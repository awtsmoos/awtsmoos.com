// B"H

import { hashCanonicalValue } from "../canonical/index.js";

const NAMESPACE_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$/i;
const STABLE_ID_PATTERN = /^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*:[0-9a-f]{16}$/i;

/** Returns whether a value is a deterministic foundation stable ID. */
export function isStableId(value) {
	return typeof value === "string" && STABLE_ID_PATTERN.test(value);
}

/**
 * Derives a stable logical identifier from an explicit namespace and identity seed.
 *
 * The Awtsmoos hides no host clock or random whisper inside this name: equal seeds
 * cross machines and awaken beneath the same sixteen-character content seal.
 */
export function createStableId(namespace, identitySeed) {
	if (typeof namespace !== "string" || !NAMESPACE_PATTERN.test(namespace)) {
		throw new TypeError("Stable-ID namespace must be a namespaced machine identifier.");
	}
	const digest = hashCanonicalValue(identitySeed).split(":")[1];
	return `${namespace}:${digest}`;
}

/** Asserts and returns an existing stable ID. */
export function assertStableId(value, label = "Stable ID") {
	if (!isStableId(value)) {
		throw new TypeError(`${label} must contain a namespace and sixteen hexadecimal digits.`);
	}
	return value;
}
