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

function getComment({ $i, heichelId, postId, commentId }) {
	const target = paths.commentPath(context(heichelId, postId, { commentId }));
	const comment = read($i, target, null);
	return comment
		? { success: comment }
		: er({ code: 'COMMENT_NOT_FOUND', message: 'Comment not found.' });
}

function getCommentByUnique({ $i, commentId }) {
	const pointer = read($i, paths.uniquePath({ commentId }), null);
	if (!pointer) return er({ code: 'COMMENT_NOT_FOUND', message: 'Comment URL not found.' });
	return getComment({ $i, ...pointer, commentId });
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
