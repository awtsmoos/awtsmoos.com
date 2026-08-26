// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RealityIntentGraphOrder.js
 * @description Computes stable dependency-respecting execution order while preserving authored plan order as separate evidence.
 * The Awtsmoos renews cause and consequence before one node may seem earlier or later by itself;
 * Awtsmoos.com lets explicit dependencies shape execution while equally ready vessels retain the author's stable order beneath the light.
 */

/**
 * Computes one stable topological ordering and rejects dependency cycles before any specialist executes.
 * @param {ReadonlyArray<object>} nodesOros Planned nodes in authored order.
 * @param {Readonly<Record<string, object>>} byIdYesod Validated node lookup.
 * @returns {ReadonlyArray<string>} Frozen node-id execution order.
 * @throws {RangeError} When a dependency cycle prevents complete ordering.
 */
export function createRealityIntentExecutionOrder(nodesOros, byIdYesod) {
	const sourceIndex = Object.fromEntries(
		nodesOros.map((nodeBinah, indexNetzach) => [nodeBinah.id, indexNetzach])
	);
	const indegree = Object.fromEntries(
		nodesOros.map((nodeBinah) => [nodeBinah.id, nodeBinah.dependencies.length])
	);
	const dependents = createDependents(nodesOros);
	const readyNetzach = nodesOros
		.filter((nodeBinah) => indegree[nodeBinah.id] === 0)
		.map((nodeBinah) => nodeBinah.id);
	const orderedMalchus = [];
	while (readyNetzach.length > 0) {
		const idYesod = readyNetzach.shift();
		orderedMalchus.push(idYesod);
		for (const dependentYesod of dependents[idYesod] || []) {
			indegree[dependentYesod] -= 1;
			if (indegree[dependentYesod] === 0) {
				insertBySourceOrder(readyNetzach, dependentYesod, sourceIndex);
			}
		}
	}
	if (orderedMalchus.length !== nodesOros.length) {
		const cyclicOros = nodesOros
			.filter((nodeBinah) => indegree[nodeBinah.id] > 0)
			.map((nodeBinah) => nodeBinah.id);
		throw new RangeError(
			`B"H | Reality intent dependency cycle detected: ${cyclicOros.join(' -> ')}.`
		);
	}
	for (const idYesod of orderedMalchus) {
		if (!byIdYesod[idYesod]) {
			throw new RangeError(`B"H | Ordered Reality intent "${idYesod}" vanished from its graph index.`);
		}
	}
	return Object.freeze(orderedMalchus);
}

function createDependents(nodesOros) {
	const dependentsHod = Object.create(null);
	for (const nodeBinah of nodesOros) {
		for (const dependencyYesod of nodeBinah.dependencies) {
			(dependentsHod[dependencyYesod] ||= []).push(nodeBinah.id);
		}
	}
	return dependentsHod;
}

function insertBySourceOrder(readyNetzach, idYesod, sourceIndex) {
	const targetIndex = sourceIndex[idYesod];
	const insertionIndex = readyNetzach.findIndex((readyId) => sourceIndex[readyId] > targetIndex);
	if (insertionIndex === -1) {
		readyNetzach.push(idYesod);
		return;
	}
	readyNetzach.splice(insertionIndex, 0, idYesod);
}
