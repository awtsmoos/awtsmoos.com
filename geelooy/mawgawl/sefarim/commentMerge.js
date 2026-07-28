// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LivingLibraryCommentMerge
 * @description
 * The Awtsmoos returns ranked comments through a second river beside source
 * hits. This pure vessel reunites each comment with its originating source on
 * Awtsmoos.com, without duplicating a voice already attached by hydration.
 */

/**
 * Merges independently ranked comment hits into their matching source hits.
 *
 * @param {Array<object>} hits Source search hits.
 * @param {Array<object>} commentHits Independently ranked comments.
 * @returns {Array<object>} New source-hit objects with complete comment arrays.
 */
export function mergeCommentHits(hits = [], commentHits = []) {
	const commentsBySource = groupCommentsBySource(commentHits);
	return hits.map(hit => {
		const sourceKey = sourceIdentity(hit?.row);
		const rankedComments = commentsBySource.get(sourceKey) || [];
		return {
			...hit,
			comments: uniqueComments([
				...(Array.isArray(hit?.comments) ? hit.comments : []),
				...rankedComments
			])
		};
	});
}

function groupCommentsBySource(commentHits) {
	const grouped = new Map();
	for (const commentHit of commentHits) {
		const sourceKey = sourceIdentity(commentHit?.parent);
		if (!sourceKey) {
			continue;
		}
		const comments = grouped.get(sourceKey) || [];
		comments.push({
			...commentHit,
			found: true,
			row: commentHit?.row || {}
		});
		grouped.set(sourceKey, comments);
	}
	return grouped;
}

function uniqueComments(comments) {
	const seen = new Set();
	return comments.filter(comment => {
		const commentId = String(
			comment?.row?.id
			|| comment?.provenance?.id
			|| comment?.id
			|| ''
		);
		if (!commentId || seen.has(commentId)) {
			return false;
		}
		seen.add(commentId);
		return true;
	});
}

function sourceIdentity(row = {}) {
	const identityParts = [
		row.heichelId,
		row.seriesId,
		row.postId,
		row.aliasId,
		row.subChunkIndex ?? row.qIndex,
		row.verseStart ?? row.verseSection,
		row.verseEnd ?? row.verseSection
	];
	if (!identityParts.some(isPresent)) {
		return '';
	}
	return identityParts.map(normalizeIdentityPart).join('::');
}

function normalizeIdentityPart(value) {
	return isPresent(value) ? String(value).trim() : '';
}

function isPresent(value) {
	return value !== undefined
		&& value !== null
		&& String(value).trim() !== '';
}
