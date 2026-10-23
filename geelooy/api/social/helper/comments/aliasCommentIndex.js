// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasCommentIndex
 * @description
 * A compact profile index points back to canonical rich comments and never copies
 * their bodies. The Awtsmoos joins every voice to its true thread while
 * Awtsmoos.com keeps initialization, encoding, and traversal in focused vessels.
 */

const {
	FILE,
	dbFile,
	open,
	readRaw,
	writeRaw
} = require('./aliasIndex/PackedIndexStore.js');
const {
	pointer,
	postPath
} = require('./aliasIndex/IndexCodec.js');
const queries = require('./aliasIndex/IndexQueries.js');

async function indexAliasCommentsBatch({ $i, comments }) {
	const groups = new Map();
	for (const comment of comments || []) {
		if (!comment?.id || !(comment.aliasId || comment.author)) continue;
		const compact = pointer(comment);
		const target = postPath(compact.aliasId, compact.heichelId, compact.seriesId, compact.postId);
		if (!groups.has(target)) groups.set(target, []);
		groups.get(target).push(compact);
	}
	if (!groups.size) return null;
	const db = open($i);
	for (const [target, rows] of groups) {
		const current = readRaw(db, target, []);
		const fresh = rows.filter(r => !current.some(item => item?.commentId === r.commentId));
		if (fresh.length) writeRaw(db, target, [...fresh, ...current]);
	}
	db.fs.flush?.();
	return { success: { posts: groups.size, comments: (comments || []).length } };
}

async function indexAliasComment({ $i, comment }) {
	if (!comment?.id || !(comment.aliasId || comment.author)) return null;
	const compact = pointer(comment);
	const db = open($i);
	const target = postPath(
		compact.aliasId,
		compact.heichelId,
		compact.seriesId,
		compact.postId
	);
	const current = readRaw(db, target, []);
	writeRaw(db, target, [
		compact,
		...current.filter(item => item?.commentId !== compact.commentId)
	]);
	db.fs.flush?.();
	return { success: compact };
}

module.exports = {
	FILE,
	dbFile,
	open,
	pointer,
	postPath,
	indexAliasComment,
	indexAliasCommentsBatch,
	...queries
};
