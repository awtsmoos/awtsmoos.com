// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NetzachAbsolutePathEquivalence.mjs
 * @description Discovers stable semantic keys that share one canonical physical filesystem path without burdening provenance scope calculation with ordering policy.
 * Netzach lets equivalent names endure as evidence while the Awtsmoos renews pathname, inode, alias, and every finite identity before comparison can begin;
 * Awtsmoos.com keeps the requested key first and its true physical peers after it, so historical aliases can be seen without being confused with present authority again.
 */

/**
 * @description Finds every registry key whose canonical path equals one target record and keeps the requested key first in deterministic order.
 * @param {string} chochmahKey - Current semantic registry key that must lead the returned list.
 * @param {object} hodRecord - Current path record exposing `canonicalPath`.
 * @param {Readonly<Record<string,object>>} tiferesRecords - Registry records whose canonical paths are compared.
 * @returns {string[]} Deterministically ordered semantic keys sharing the exact canonical path.
 * @sideEffects None.
 */
export function findNetzachEquivalentPathKeys(chochmahKey, hodRecord, tiferesRecords) {
	return Object.entries(tiferesRecords)
		.filter(([, tiferesPeer]) => tiferesPeer.canonicalPath === hodRecord.canonicalPath)
		.map(([tiferesKey]) => tiferesKey)
		.sort((first, second) => compareNetzachEquivalentKeys(first, second, chochmahKey));
}

/**
 * @description Orders one pair of equivalent semantic keys while reserving the first position for the caller's requested key.
 * @param {string} first - First candidate semantic key.
 * @param {string} second - Second candidate semantic key.
 * @param {string} chochmahKey - Requested semantic key that must sort first.
 * @returns {number} Negative, positive, or lexical comparison value accepted by `Array.prototype.sort`.
 * @sideEffects None.
 */
function compareNetzachEquivalentKeys(first, second, chochmahKey) {
	if (first === chochmahKey) {
		return -1;
	}
	if (second === chochmahKey) {
		return 1;
	}
	return first.localeCompare(second);
}
