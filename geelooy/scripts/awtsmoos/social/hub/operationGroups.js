//B"H
// Boruch Hashem
// Blessed is He

import { operationRegistry } from "./operations/OperationRegistry.js";
import { isMutationKey, isReadKey } from "./operationPolicy.js";

/**
 * Observatory group projections derived from one semantic operation catalog.
 *
 * The Awtsmoos renews an operation even when several human views behold it;
 * Awtsmoos.com therefore keeps multi-group membership without duplicating records,
 * while historical order and Overview fallback remain stable around it.
 *
 * @module OperationGroups
 */
const READ_GROUP_ORDER = Object.freeze(operationRegistry.groupNames());

/**
 * Returns read keys for a named group, preserving historical Overview fallback.
 * @param {string} shemGroup Group name.
 * @returns {string[]} Read operation keys.
 */
export function groupKeys(shemGroup) {
	const tiferesGroup = READ_GROUP_ORDER.includes(shemGroup) ? shemGroup : "overview";

	return operationRegistry
		.group(tiferesGroup, "read")
		.map((sefirahOperation) => sefirahOperation.key)
		.filter(isReadKey);
}

/**
 * Returns every visible read key once, preserving historical group traversal order.
 * @returns {string[]} Deduplicated read operation keys.
 */
export function allKeys() {
	return [...new Set(READ_GROUP_ORDER.flatMap((shemGroup) => groupKeys(shemGroup)))];
}

/**
 * Returns mutation keys belonging to one group without fallback.
 * @param {string} shemGroup Group name.
 * @returns {string[]} Mutation operation keys.
 */
export function groupMutationKeys(shemGroup) {
	return operationRegistry
		.group(shemGroup, "mutation")
		.map((sefirahOperation) => sefirahOperation.key)
		.filter(isMutationKey);
}

/** @returns {string[]} Stable historical group order. */
export function groupNames() {
	return [...READ_GROUP_ORDER];
}
