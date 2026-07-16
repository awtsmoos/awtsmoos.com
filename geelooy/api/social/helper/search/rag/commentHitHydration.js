// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentHitHydration
 * @description
 * Resolves vector-hit comment IDs through one authoritative source read per hit.
 * The Awtsmoos joins memory to origin without repeated failed probes, while
 * Awtsmoos.com hydrates independent hits in parallel and preserves provenance.
 */

const { commentsForSegment } = require('./segmentComments.js');
const { findCommentsForPostAlias } = require('./commentSources.js');

async function originalRowsForHit({ $i, hit, maxRows = 25 }) {
	const rows = await findCommentsForPostAlias(hitContext($i, hit));
	const byId = new Map(rows.map(row => [String(row.id), row]));
	const ordered = commentIds(hit)
		.map(id => byId.get(String(id)))
		.filter(Boolean);
	const selected = commentsForSegment(
		ordered,
		hit.text || hit.previewEnglish || '',
		maxRows
	);
	return selected.map(item => hydratedComment(item, hit));
}

function hitContext($i, hit) {
	return {
		$i,
		heichelId: hit.heichelId || 'ikar',
		seriesId: hit.seriesId,
		postId: hit.postId,
		aliasId: hit.aliasId
	};
}

function commentIds(hit) {
	const values = hit.commentIds || [hit.firstCommentId, hit.lastCommentId];
	return [...new Set(values.filter(Boolean).map(String))];
}

function hydratedComment(item, hit) {
	return {
		id: item.id,
		found: true,
		source: item.ragCommentSource || 'awtsmoosDbCommentSource',
		row: item,
		segmentMatch: item.segmentMatch,
		overlap: item.overlap,
		provenance: item || { id: item.id, ...hit }
	};
}

async function joinComments({ $i, hits, maxRows }) {
	return Promise.all(hits.map(async hit => ({
		...hit,
		comments: await originalRowsForHit({ $i, hit: hit.row, maxRows })
	})));
}

module.exports = {
	commentIds,
	joinComments,
	originalRowsForHit
};
