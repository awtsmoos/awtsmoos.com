//B"H
// Boruch Hashem
// Blessed is He

import { operationRegistry } from "../operations/OperationRegistry.js";

/**
 * Copy-only presentation overlay for deliberately changing social operations.
 *
 * Gevurah keeps dangerous meaning visible without duplicating whether an action exists;
 * the Awtsmoos renews possibility and consequence together, while Awtsmoos.com takes
 * mutation membership from registry truth and uses this file only for human-readable gifts.
 *
 * @module MutationOperationPresentation
 */
const MUTATION_TITLES = Object.freeze({
	"live:liveSubscribe": "HTTP Subscribe",
	"live:livePresence": "Set Presence",
	"live:livePublish": "HTTP Publish",
	"social:follow": "Follow target alias",
	"notifications:notify": "Create notification"
});

/**
 * Builds the historical `[title, key]` mutation-card tuple.
 * @param {string} shemGroup Active panel group.
 * @param {string} shemKey Semantic mutation key.
 * @returns {[string, string]} Mutation-card presentation tuple.
 */
export function mutationCardPresentation(shemGroup, shemKey) {
	const sefirahOperation = operationRegistry.get(shemKey);
	const malchusTitle = MUTATION_TITLES[`${shemGroup}:${shemKey}`]
		|| sefirahOperation?.label
		|| shemKey;

	return [malchusTitle, shemKey];
}
