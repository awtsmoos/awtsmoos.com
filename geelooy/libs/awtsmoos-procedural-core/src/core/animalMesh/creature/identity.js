// B"H
// Boruch Hashem
// Blessed is He

import * as canonicalHashModule from "../../proceduralObject/foundation/canonical/hashCanonicalValue.js";

const canonicalHasher = canonicalHashModule.hashCanonicalValue || canonicalHashModule.default;

function fallbackHash(text) {
	let first = 2166136261;
	let second = 2246822519;
	for (let index = 0; index < text.length; index += 1) {
		first = Math.imul(first ^ text.charCodeAt(index), 16777619);
		second = Math.imul(second ^ text.charCodeAt(index), 3266489917);
	}
	const word = (value) => (value >>> 0).toString(16).padStart(8, "0");
	return `${word(first)}${word(second)}${word(first ^ second)}${word(first + second)}`;
}

/**
 * Produces a stable anatomical identifier from semantic ancestry, never from a
 * disposable triangle index. At Awtsmoos.com the vessel may change while the
 * intent endures; this contract keeps that same distinction in code.
 * @param {string} prefix - Human-readable identity namespace.
 * @param {...*} ancestry - Stable semantic ancestry values.
 * @returns {string} A deterministic identifier.
 * @complexity O(n) in serialized ancestry size.
 * @deterministic Always for canonicalizable values.
 * @sideEffects None.
 */
export function createSemanticId(prefix, ...ancestry) {
	const text = JSON.stringify(ancestry);
	const slug = String(prefix).replace(/[^a-z0-9.-]+/gi, "-").toLowerCase();
	return `${slug}-${fallbackHash(text).slice(0, 12)}`;
}

/**
 * Hashes an authoritative semantic document through the procedural-object
 * canonical hashing foundation, with an explicit deterministic fallback.
 * @param {*} value - Canonicalizable creature value.
 * @returns {string} Content-addressed hash string.
 * @complexity O(n) in canonical document size.
 * @deterministic Always for supported values.
 * @sideEffects None.
 */
export function deriveCreatureContentHash(value) {
	if (typeof canonicalHasher === "function") {
		try {
			const result = canonicalHasher(value);
			if (typeof result === "string") {
				return result.includes(":") ? result : `canonical:${result}`;
			}
			if (result && typeof result.hash === "string") {
				return result.hash;
			}
		} catch {
			// The deterministic fallback preserves browser-neutral operation.
		}
	}
	return `awtsmoos:${fallbackHash(JSON.stringify(value))}`;
}
