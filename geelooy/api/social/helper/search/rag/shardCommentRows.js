// B\"H
// Boruch Hashem
// Blessed is He

/**
 * @module RagShardCommentRows
 * @description
 * A searchable source window opens only its exact derived alias shard. The
 * Awtsmoos reveals the requested post, closes the vessel immediately, and never
 * awakens the global packed comment database for interactive RAG hydration.
 */

const {
	readAliasAll
} = require('../../comments/commentShardBridge.js');

function shardCommentRows(context = {}) {
	try {
		const result = readAliasAll({
			$i: context.$i,
			heichelId: context.heichelId || 'ikar',
			seriesId: context.seriesId,
			parentId: context.postId,
			parentType: 'post',
			aliasId: context.aliasId
		});
		const rows = Array.isArray(result?.data) ? result.data : [];
		return rows
			.map(row => normalizeShardRow(row, context, result))
			.filter(row => row.id);
	} catch (error) {
		if (isMissingShard(error)) return [];
		throw error;
	}
}

function normalizeShardRow(row = {}, context = {}, result = {}) {
	return {
		...row,
		id: row.id || row.commentId || '',
		aliasId: row.aliasId || row.author || context.aliasId || '',
		author: row.author || row.aliasId || context.aliasId || '',
		heichelId: row.heichelId || context.heichelId || 'ikar',
		seriesId: row.seriesId || context.seriesId || '',
		postId: row.postId || context.postId || '',
		ragCommentSource: 'commentShard',
		ragCommentShard: {
			file: result.file || null,
			family: result.majorId || null
		}
	};
}

function isMissingShard(error) {
	return ['ENOENT', 'NOT_FOUND', 'COMMENT_SHARD_NOT_FOUND'].includes(error?.code);
}

module.exports = {
	isMissingShard,
	normalizeShardRow,
	shardCommentRows
};
