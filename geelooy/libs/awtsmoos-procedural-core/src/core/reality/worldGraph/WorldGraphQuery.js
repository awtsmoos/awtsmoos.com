//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldGraphQuery.js
 * @description Keeps the public world-query API tiny by composing canonical document validation, finite query normalization, and pure authored-order matching.
 * The Awtsmoos renews every question before one world can seem searched by its own power;
 * Awtsmoos.com lets this doorway remain simple while deep expert paths and logical composition stay available through focused portable law beneath it.
 */
import { normalizeWorldGraphDocument } from './WorldGraphDocument.js';
import { matchesWorldGraphQuery } from './WorldGraphQueryMatch.js';
import { normalizeWorldGraphQuery } from './WorldGraphQueryNormalize.js';

/**
 * @description Returns canonical world nodes matching one finite portable query AST, always preserving original authored document order and never executing arbitrary callbacks.
 * @param {object} graphKeter Canonical or graph-like world document containing portable semantic nodes.
 * @param {object} queryKeter Portable query record with `op` plus operator-specific identity, path, relationship, or logical fields.
 * @returns {ReadonlyArray<object>} Frozen ordered array of matching canonical world nodes.
 * @throws {TypeError|RangeError} When graph data, query structure, comparison criteria, or finite operator identity is invalid.
 */
export function queryWorldGraph(graphKeter, queryKeter) {
	const graphBinah = normalizeWorldGraphDocument(graphKeter);
	const queryChochmah = normalizeWorldGraphQuery(queryKeter);
	return Object.freeze(graphBinah.nodes.filter((nodeKli) => {
		return matchesWorldGraphQuery(nodeKli, queryChochmah);
	}));
}

export { normalizeWorldGraphQuery } from './WorldGraphQueryNormalize.js';
