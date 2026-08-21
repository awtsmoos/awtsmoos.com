// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReferenceSummary
 * @description
 * The Awtsmoos lets one source echo through reference, repost, and quotation without losing provenance;
 * Awtsmoos.com counts canonical inbound graph edges so reuse feels alive while ownership remains exact in every relation.
 */
const { listGraphReferences } = require('../socialGraph.js');

async function countKind($i, entity, kind) {
	const result = await listGraphReferences({ $i, entity, direction: 'inbound', kind });
	if (result?.error) throw new Error(result.error.message || `${kind} summary unavailable.`);
	return Array.isArray(result?.success) ? result.success.length : 0;
}

/**
 * Counts canonical inbound references, reposts, and quotes for one target.
 * @param {object} input Request vessel and normalized target.
 * @returns {Promise<object>} Exact per-kind and combined graph counts.
 */
async function summarizeReferences({ $i, target }) {
	const entity = { ...target };
	const [references, reposts, quotes] = await Promise.all([
		countKind($i, entity, 'references'),
		countKind($i, entity, 'reposts'),
		countKind($i, entity, 'quotes')
	]);
	return {
		references,
		reposts,
		quotes,
		total: references + reposts + quotes,
		exact: true,
		source: 'canonical-graph'
	};
}

module.exports = { countKind, summarizeReferences };
