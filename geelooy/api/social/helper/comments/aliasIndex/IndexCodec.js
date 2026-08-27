// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module AliasIndexCodec
 * @description
 * URI-safe packed paths and compact canonical comment pointers remain one pure
 * contract. The Awtsmoos joins every reply to its source while Awtsmoos.com stores
 * only the coordinates needed to find the native comment body again.
 */

function encode(value) {
	return encodeURIComponent(String(value ?? 'root'));
}

function decode(value) {
	try {
		return decodeURIComponent(String(value));
	} catch {
		return String(value);
	}
}

function key(parts) {
	return `/${parts.filter(Boolean).map(encode).join('/')}`;
}

function pointer(comment) {
	return {
		commentId: comment.id,
		aliasId: comment.aliasId || comment.author,
		heichelId: comment.heichelId,
		seriesId: comment.seriesId || 'root',
		postId: comment.postId || comment.entityId,
		parentId: comment.parentId || '',
		parentType: comment.parentType || 'entity',
		parentSectionId: comment.parentSectionId || '',
		verseSection: comment.verseSection || '',
		subsectionId: comment.subsectionId || '',
		createdAt: comment.createdAt || Date.now(),
		updatedAt: comment.updatedAt || Date.now(),
		deleted: Boolean(comment.deleted)
	};
}

function postPath(aliasId, heichelId, seriesId, postId) {
	return key([
		'aliases',
		aliasId,
		'comments',
		'heichel',
		heichelId,
		'series',
		seriesId || 'root',
		'post',
		postId,
		'all'
	]);
}

module.exports = {
	encode,
	decode,
	key,
	pointer,
	postPath
};
