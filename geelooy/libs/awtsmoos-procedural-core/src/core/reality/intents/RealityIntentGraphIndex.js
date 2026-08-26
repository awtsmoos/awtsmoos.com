// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentGraphIndex.js
 * @description Validates node identity and explicit scene references before any procedural specialist is allowed to execute.
 * The Awtsmoos renews every relation before one finite node may claim another as its source or neighbor;
 * Awtsmoos.com turns `around`, `near`, `on`, `parent`, and `source` into truthful graph law so missing and circular-looking names cannot hide as vapor.
 */

/**
 * Builds a frozen id lookup after rejecting duplicate ids, missing dependencies, and direct self references.
 * @param {ReadonlyArray<object>} nodesOros Planned Reality intent nodes.
 * @returns {Readonly<Record<string, object>>} Frozen node lookup keyed by exact stable id.
 * @throws {RangeError} When graph identity or references are invalid.
 */
export function createRealityIntentGraphIndex(nodesOros) {
	const byIdYesod = Object.create(null);
	for (const nodeBinah of nodesOros) {
		if (byIdYesod[nodeBinah.id]) {
			throw new RangeError(`B"H | Duplicate Reality intent id "${nodeBinah.id}".`);
		}
		byIdYesod[nodeBinah.id] = nodeBinah;
	}
	for (const nodeBinah of nodesOros) {
		validateDependencies(nodeBinah, byIdYesod);
	}
	return Object.freeze(byIdYesod);
}

function validateDependencies(nodeBinah, byIdYesod) {
	for (const dependencyYesod of nodeBinah.dependencies) {
		if (dependencyYesod === nodeBinah.id) {
			throw new RangeError(
				`B"H | Reality intent "${nodeBinah.id}" cannot depend on itself.`
			);
		}
		if (!byIdYesod[dependencyYesod]) {
			throw new RangeError(
				`B"H | Reality intent "${nodeBinah.id}" references missing node "${dependencyYesod}".`
			);
		}
	}
}
