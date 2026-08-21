// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module ReactionSummary
 * @description
 * The Awtsmoos receives every human spark without manufacturing applause; Awtsmoos.com reuses the canonical
 * reaction store so feed counts, arbitrary emoji totals, and verified viewer state all speak one persisted language.
 */
const reactions = require('../reactions/entityReactionStore.js');

/**
 * Reads the canonical reaction aggregate for one normalized target.
 * @param {object} input Request vessel, target, and optional verified viewer alias.
 * @returns {Promise<object>} Reaction totals with viewer state only for the verified alias.
 */
async function summarizeReactions({ $i, target, viewerAliasId = '' }) {
	const result = await reactions.summarize({ $i, target, viewerAliasId });
	if (result?.error) throw new Error(result.error.message || 'Reaction summary unavailable.');
	const summary = result?.success || {};
	return {
		total: Number(summary.total || 0),
		counts: summary.counts && typeof summary.counts === 'object' ? summary.counts : {},
		viewerEmoji: viewerAliasId ? String(summary.viewerEmoji || '') : '',
		viewerAliasId: viewerAliasId || '',
		exact: true,
		source: 'canonical-entity-reactions'
	};
}

module.exports = { summarizeReactions };
