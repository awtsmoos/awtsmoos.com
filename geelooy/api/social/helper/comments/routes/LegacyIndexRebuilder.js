// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module LegacyIndexRebuilder
 * @description
 * Old `atSeries/atPost/author/comment` trees are traversed into compact packed
 * pointers without copying canonical comment bodies. The Awtsmoos holds every
 * generation together while Awtsmoos.com migrates only evidence it can identify.
 */

const aliasIndex = require('../aliasCommentIndex.js');
const { read } = require('./LegacyIndexReader.js');

function contextFromPath(context, key, value) {
	const next = { ...context };
	if (context.expect === 'series') next.seriesId = key;
	if (context.expect === 'post') next.postId = key;
	if (context.expect === 'author') next.aliasId = key;
	if (context.expect === 'comment') next.commentId = key;
	if (key === 'atSeries') next.expect = 'series';
	else if (key === 'atPost') next.expect = 'post';
	else if (key === 'author') next.expect = 'author';
	else if (key === 'comment') next.expect = 'comment';
	else if (context.expect) next.expect = '';
	if (value?.seriesId) next.seriesId = String(value.seriesId);
	if (value?.postId || value?.entityId) {
		next.postId = String(value.postId || value.entityId);
	}
	if (value?.aliasId || value?.author) {
		next.aliasId = String(value.aliasId || value.author);
	}
	if (value?.id || value?.commentId) {
		next.commentId = String(value.id || value.commentId);
	}
	return next;
}

function candidateComment(value, context, heichelId) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
	const id = value.id || value.commentId || context.commentId;
	const aliasId = value.aliasId || value.author || context.aliasId;
	const seriesId = value.seriesId || context.seriesId;
	const postId = value.postId || value.entityId || context.postId;
	if (!id || !aliasId || !seriesId || !postId) return null;
	return {
		...value,
		id: String(id),
		aliasId: String(aliasId),
		heichelId: String(value.heichelId || heichelId),
		seriesId: String(seriesId),
		postId: String(postId)
	};
}

function collectComments(value, context, heichelId, output, seen) {
	if (!value || typeof value !== 'object') return;
	const candidate = candidateComment(value, context, heichelId);
	if (candidate && !seen.has(candidate.id)) {
		seen.add(candidate.id);
		output.push(candidate);
	}
	for (const [key, child] of Object.entries(value)) {
		if (!child || typeof child !== 'object') continue;
		collectComments(
			child,
			contextFromPath(context, key, child),
			heichelId,
			output,
			seen
		);
	}
}

async function legacyCommentTree($i, heichelId) {
	return read(
		$i,
		`/social/heichelos/${heichelId}/comments`,
		{}
	);
}

async function rebuildLegacyAliasIndex({ $i, heichelId, aliasId }) {
	const comments = [];
	collectComments(
		await legacyCommentTree($i, heichelId),
		{},
		heichelId,
		comments,
		new Set()
	);
	let indexed = 0;
	for (const comment of comments) {
		if (aliasId && comment.aliasId !== aliasId) continue;
		const result = await aliasIndex.indexAliasComment({ $i, comment });
		if (result?.success) indexed += 1;
	}
	return {
		success: {
			message: 'All comment indexes updated successfully!',
			indexed,
			heichelId,
			aliasId
		}
	};
}

module.exports = {
	contextFromPath,
	candidateComment,
	collectComments,
	legacyCommentTree,
	rebuildLegacyAliasIndex
};
