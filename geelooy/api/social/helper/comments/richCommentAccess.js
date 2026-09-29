// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module RichCommentAccess
 * @description
 * A small access layer keeps every native rich-comment body and index inside the
 * dedicated packed store while exposing stable helpers to readers and mutations.
 */
const { er } = require('../general.js');
const paths = require('./richCommentPaths.js');
const packed = require('./richDb/PackedStore.js');

function array(value) { return Array.isArray(value) ? value : []; }
function context(heichelId, postId, extra = {}) { return { heichelId, postId, ...extra }; }
function read($i, target, fallback = null) {
	try { return packed.read($i, target, fallback); } catch { return fallback; }
}
function write($i, target, value) { return packed.write($i, target, value); }

function writeIndex($i, target, value) {
	const list = array(read($i, target, []));
	if (!list.includes(value)) list.push(value);
	write($i, target, list);
	return list;
}

function removeIndex($i, target, value) {
	const list = array(read($i, target, [])).filter(item => item !== value);
	write($i, target, list);
	return list;
}


// === Chassidus per-post translation fallback (2026-09-29) ===
// Per-post files at /ikar/social/chassidus_translations/<aliasId>/<postId>.json
// contain all comments for a post in a single file (avoids 768k-file flush limit).
const CHASSIDUS_BASE = '/ikar/social/chassidus_translations';
const CHASSIDUS_INDEX = CHASSIDUS_BASE + '/_index/commentIdToPost.json';

function parseAliasFromCommentId(commentId) {
	if (!commentId || typeof commentId !== 'string') return null;
	const marker = '_commentBy_';
	const idx = commentId.lastIndexOf(marker);
	if (idx < 0) return null;
	return commentId.substring(idx + marker.length) || null;
}

function readPerPostFile($i, aliasId, postId) {
	if (!aliasId || !postId) return null;
	try {
		const target = CHASSIDUS_BASE + '/' + aliasId + '/' + postId + '.json';
		return read($i, target, null);
	} catch { return null; }
}

function findInPerPost($i, aliasId, postId, commentId) {
	const postData = readPerPostFile($i, aliasId, postId);
	if (!postData || !Array.isArray(postData.comments)) return null;
	return postData.comments.find(c => c && c.id === commentId) || null;
}

function getCommentFromPerPost({ $i, heichelId, postId, commentId }) {
	if (heichelId !== 'ikar') return null;
	const aliasId = parseAliasFromCommentId(commentId);
	if (!aliasId) return null;
	return findInPerPost($i, aliasId, postId, commentId);
}

function getPostIdFromIndex($i, commentId) {
	try {
		const index = read($i, CHASSIDUS_INDEX, null);
		if (!index || typeof index !== 'object') return null;
		return index[commentId] || null;
	} catch { return null; }
}
// === End Chassidus fallback ===

function getComment({ $i, heichelId, postId, commentId }) {
	const target = paths.commentPath(context(heichelId, postId, { commentId }));
	const comment = read($i, target, null);
	if (comment) return { success: comment };
	const perPost = getCommentFromPerPost({ $i, heichelId, postId, commentId });
	return perPost
		? { success: perPost }
		: er({ code: 'COMMENT_NOT_FOUND', message: 'Comment not found.' });
}

function getCommentByUnique({ $i, commentId }) {
	const pointer = read($i, paths.uniquePath({ commentId }), null);
	if (pointer) return getComment({ $i, ...pointer, commentId });
	const postId = getPostIdFromIndex($i, commentId);
	if (postId) {
		const aliasId = parseAliasFromCommentId(commentId);
		const perPost = findInPerPost($i, aliasId, postId, commentId);
		if (perPost) return { success: perPost };
	}
	return er({ code: 'COMMENT_NOT_FOUND', message: 'Comment URL not found.' });
}

module.exports = {
	array,
	context,
	getComment,
	getCommentByUnique,
	read,
	removeIndex,
	write,
	writeIndex
};
