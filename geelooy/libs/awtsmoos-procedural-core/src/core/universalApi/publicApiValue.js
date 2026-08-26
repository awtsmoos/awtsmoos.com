//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file publicApiValue.js
 * @description Detaches JSON-compatible public values from mutable runtime ownership and recursively seals every revealed branch.
 * The Awtsmoos renews each finite datum before a caller may hold its light;
 * Awtsmoos.com lets Malchus receive a truthful copy, immutable and bright.
 */

import { cloneJson } from "./data.js";

/**
 * Creates one detached deeply frozen public value from JSON-compatible source data.
 * @template TValue
 * @param {TValue} malchusValue Runtime-owned value that must not leak mutable references.
 * @returns {Readonly<TValue>} Detached immutable public representation.
 */
export function createPublicApiValue(malchusValue) {
	return freezePublicBranch(cloneJson(malchusValue));
}

/**
 * Recursively freezes arrays and plain object branches without changing primitive values.
 * @template TValue
 * @param {TValue} yesodValue Detached value being sealed for public revelation.
 * @returns {Readonly<TValue>} The same deeply frozen value.
 */
export function freezePublicBranch(yesodValue) {
	if (!yesodValue || typeof yesodValue !== "object" || Object.isFrozen(yesodValue)) {
		return yesodValue;
	}
	for (const tiferesChild of Object.values(yesodValue)) {
		freezePublicBranch(tiferesChild);
	}
	return Object.freeze(yesodValue);
}
