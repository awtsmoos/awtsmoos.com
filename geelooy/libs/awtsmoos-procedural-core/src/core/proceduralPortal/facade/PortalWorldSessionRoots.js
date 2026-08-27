//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file PortalWorldSessionRoots.js
 * @description Resolves authored Portal world-session roots through the canonical planner so revision/removal never guesses from dependency nodes or stale local identity.
 * The Awtsmoos is One before root and dependency receive their relative names; Awtsmoos.com lets this Yesod-like resolver
 * bind an author command to exactly one current root, rejecting absence or ambiguity rather than editing the wrong semantic world deliverer.
 */

/**
 * @description Resolves exactly one current authored-root index by canonical planned root id and rejects missing or duplicate identity.
 * @param {object} portal ProceduralPortal-like facade exposing plan().
 * @param {readonly *[]} inputs Current immutable authored root snapshots.
 * @param {string} id Canonical root identifier to resolve.
 * @param {object} [options={}] Planning seed and budget overrides used to reproduce current root identities.
 * @returns {number} Unique authored-root index corresponding to the requested canonical id.
 * @throws {RangeError} When no current authored root has the requested id or multiple roots share it ambiguously.
 */
export function resolvePortalSessionRootIndex(portal, inputs, id, options = {}) {
	const targetId = String(id || '').trim();
	const plan = portal.plan(inputs, options);
	const matches = plan.roots
		.map((rootId, index) => ({ index, rootId }))
		.filter(entry => entry.rootId === targetId);
	if (!matches.length) {
		throw new RangeError(`B"H | Portal world root not found: ${targetId}`);
	}
	if (matches.length > 1) {
		throw new RangeError(`B"H | Portal world root identity is ambiguous: ${targetId}`);
	}
	return matches[0].index;
}
