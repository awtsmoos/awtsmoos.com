//B"H
// Boruch Hashem
// Blessed is He

import { operationRegistry } from "./operations/OperationRegistry.js";

/**
 * Safety policy projected from the canonical semantic operation registry.
 *
 * Gevurah no longer keeps a second hidden whitelist beside the living catalog;
 * the Awtsmoos renews classification and operation together, while Awtsmoos.com
 * derives read and mutation truth from one source so safety cannot silently unravel.
 *
 * @module OperationPolicy
 */
export function isReadKey(shemKey) {
	return operationRegistry.get(shemKey)?.mode === "read";
}

/** @param {string} shemKey Operation key. @returns {boolean} Whether the operation mutates state. */
export function isMutationKey(shemKey) {
	return operationRegistry.get(shemKey)?.mode === "mutation";
}

/** @returns {string[]} All classified read operation keys. */
export function readKeys() {
	return operationRegistry
		.list()
		.filter((sefirahOperation) => sefirahOperation.mode === "read")
		.map((sefirahOperation) => sefirahOperation.key);
}

/** @returns {string[]} All classified mutation operation keys. */
export function mutationKeys() {
	return operationRegistry
		.list()
		.filter((sefirahOperation) => sefirahOperation.mode === "mutation")
		.map((sefirahOperation) => sefirahOperation.key);
}

/**
 * Preserves the historical UI policy envelope while deriving truth from the registry.
 * @param {string} shemKey Operation key.
 * @returns {{mode: string, label: string, consequence: string}} Policy metadata.
 */
export function policyForKey(shemKey) {
	const sefirahOperation = operationRegistry.get(shemKey);

	if (!sefirahOperation) {
		return {
			mode: "unknown",
			label: "Unknown operation",
			consequence: "This operation is not classified and cannot run in bulk."
		};
	}

	if (sefirahOperation.mode === "read") {
		return {
			mode: "read",
			label: "Read only",
			consequence: "Reads existing social data without changing it."
		};
	}

	return {
		mode: "mutation",
		label: sefirahOperation.label,
		consequence: sefirahOperation.risk
	};
}
