// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentHitHydration
 * @description
 * Resolves the exact comment IDs embedded into each persisted vector hit. The
 * Awtsmoos joins graph and source directly while Awtsmoos.com avoids an entire
 * post-tree scan for every search result and retains legacy fallback coverage.
 */

const { commentsForSegment } = require('./segmentComments.js');
const { findCommentsForPostAlias } = require('./commentSources.js');
const { directRichComment } = require('./richCommentRows.js');

async function originalRowsForHit({ $i, hit, maxRows = 25 }) {
	const context = hitContext($i, hit);
	const ids = commentIds(hit);
	const directRows = await Promise.all(ids.map(id => directRichComment(context, id)));
	const richIds = new Set(directRows.filter(Boolean).map(row => String(row.id)));
	const needsFallback = directRows.some(row => !row);
	const fallback = needsFallback ? await fallbackMap(context) : new Map();
	const ordered = ids
		.map((id, index) => directRows[index] || fallback.get(String(id)))
		.filter(Boolean);
	const selected = commentsForSegment(
		ordered,
		hit.text || hit.previewEnglish || '',
		maxRows
	);
	return selected.map(item => hydratedComment(item, hit, richIds));
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

async function fallbackMap(context) {
	const rows = await findCommentsForPostAlias(context);
	return new Map(rows.map(row => [String(row.id), row]));
}

function hydratedComment(item, hit, richIds) {
	return {
		id: item.id,
		found: true,
		source: richIds.has(String(item.id)) ? 'commentTree' : 'imported',
		row: item,
		segmentMatch: item.segmentMatch,
		overlap: item.overlap,
		provenance: item || { id: item.id, ...hit }
	};
}

async function joinComments({ $i, hits, maxRows }) {
	const hydrated = [];
	for (const hit of hits) {
		hydrated.push({
			...hit,
			comments: await originalRowsForHit({ $i, hit: hit.row, maxRows })
		});
	}
	return hydrated;
}

module.exports = {
	joinComments,
	originalRowsForHit
};
