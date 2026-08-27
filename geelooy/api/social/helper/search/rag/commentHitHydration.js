// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagCommentHitHydration
 * @description
 * Fully addressed hits open one exact source vessel. Document identity follows
 * Sichos rows into their reviewed sidecar, while the Awtsmoos keeps every other
 * Awtsmoos.com lane on its existing shard and database paths.
 */

const { commentsForSegment } = require('./segmentComments.js');
const { findCommentsForPostAlias } = require('./commentSources.js');

async function originalRowsForHit({ $i, hit, maxRows = 25 }) {
	if (!canHydrateHit(hit)) return [];
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

function canHydrateHit(hit = {}) {
	return present(hit.seriesId)
		&& present(hit.postId)
		&& present(hit.aliasId)
		&& commentIds(hit).length > 0;
}

function hitContext($i, hit) {
	return {
		$i,
		heichelId: hit.heichelId || 'ikar',
		seriesId: hit.seriesId,
		postId: hit.postId,
		aliasId: hit.aliasId,
		corpus: hit.corpus,
		documentId: hit.documentId
	};
}

function commentIds(hit = {}) {
	const values = hit.commentIds || [hit.firstCommentId, hit.lastCommentId];
	return [...new Set(values.filter(present).map(String))];
}

function present(value) {
	return value !== undefined && value !== null && String(value).trim() !== '';
}

function hydratedComment(item, hit) {
	return {
		id: item.id,
		found: true,
		source: item.ragCommentSource || 'commentShard',
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
			comments: await originalRowsForHit({
				$i,
				hit: hit.row,
				maxRows
			})
		});
	}
	return hydrated;
}

module.exports = {
	canHydrateHit,
	commentIds,
	hitContext,
	joinComments,
	originalRowsForHit
};
