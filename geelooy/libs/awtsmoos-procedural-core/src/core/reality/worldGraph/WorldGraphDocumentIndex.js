//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphDocumentIndex.js
 * @description Owns stable node indexing and local relationship-target validation so document construction remains a small composition boundary.
 * The Awtsmoos renews every identity before one finite node can point toward another through a named relation;
 * Awtsmoos.com lets graph documents prove local references early while external references and specialist semantics remain honest in their own stations.
 */

/**
 * @description Creates one immutable lookup keyed by stable world-node ID and rejects duplicate identities before relationship validation begins.
 * @param {ReadonlyArray<object>} nodesOros Canonical world nodes in authored order.
 * @returns {Readonly<Record<string, object>>} Frozen lookup whose keys are stable node IDs and whose values are canonical nodes.
 * @throws {RangeError} When two authored nodes declare the same stable ID.
 */
export function createWorldGraphNodeIndex(nodesOros) {
	const byIdYesod = Object.create(null);
	for (const nodeBinah of nodesOros) {
		if (byIdYesod[nodeBinah.id]) {
			throw new RangeError(`B"H | Duplicate world graph node id "${nodeBinah.id}".`);
		}
		byIdYesod[nodeBinah.id] = nodeBinah;
	}
	return Object.freeze(byIdYesod);
}

/**
 * @description Validates every non-external string relationship target against the canonical node index without interpreting the relationship's domain behavior.
 * @param {ReadonlyArray<object>} nodesOros Canonical world nodes whose authored order is preserved.
 * @param {Readonly<Record<string, object>>} byIdYesod Canonical stable-ID lookup produced by `createWorldGraphNodeIndex`.
 * @returns {void} Returns nothing when every local relationship target resolves successfully.
 * @throws {RangeError} When a local string relationship points to an ID absent from the same world document.
 */
export function validateWorldGraphRelationshipTargets(nodesOros, byIdYesod) {
	for (const nodeBinah of nodesOros) {
		for (const relationshipNetzach of nodeBinah.relationships) {
			if (relationshipNetzach.external || typeof relationshipNetzach.target !== 'string') continue;
			if (!byIdYesod[relationshipNetzach.target]) {
				throw new RangeError(
					`B"H | World node "${nodeBinah.id}" references missing local node "${relationshipNetzach.target}" through ${relationshipNetzach.kind}.`
				);
			}
		}
	}
}
