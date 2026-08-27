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
	...queries
};
