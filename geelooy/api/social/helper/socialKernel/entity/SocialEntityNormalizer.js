// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityNormalizer
 * @description
 * The Awtsmoos creates one essence beneath activity wrappers, route coordinates, and stored records that differ;
 * Awtsmoos.com keeps each entity's own identity above its parent coordinates, so comments never become posts by error.
 */
const { isSocialEntityType } = require('./SocialEntityType.js');

const POST_LIKE_HINTS = Object.freeze([
	'post', 'article', 'image', 'audio', 'video', 'story', 'poll', 'live',
	'reference', 'repost', 'share', 'quote'
]);

function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function sourceOf(input = {}) {
	return input?.source && typeof input.source === 'object' ? input.source : input;
}

function classifiedType(raw = '') {
	const value = String(raw || '').toLowerCase();
	if (!value) return '';
	if (value.includes('question')) return 'question';
	if (value.includes('answer')) return 'answer';
	if (value.includes('comment') || value.includes('reply')) return 'comment';
	if (value.includes('heichel')) return 'heichel';
	if (value.includes('series')) return 'series';
	if (value.includes('alias') || value.includes('profile')) return 'alias';
	if (value.includes('notification')) return 'notification';
	if (value.includes('collection')) return 'collection';
	if (value.includes('repost') || value.includes('share')) return 'repost';
	if (POST_LIKE_HINTS.some(hint => value.includes(hint))) return 'post';
	return '';
}

function inferType(input = {}, source = sourceOf(input)) {
	const explicit = text(input.type, input.entityType);
	if (explicit) {
		const classified = classifiedType(explicit);
		if (classified) return classified;
		if (isSocialEntityType(explicit)) return explicit.toLowerCase();
		return '';
	}
	const sourceHint = text(
		source.contentType,
		source.postKind,
		source.entityType,
		source.type,
		input.contentType,
		input.postKind
	);
	return classifiedType(sourceHint) || (sourceHint ? 'post' : '');
}

function entityId(type, input, source) {
	const directId = text(input.id, input.entityId);
	if (directId) return directId;
	if (type === 'comment') return text(source.commentId, source.id, source.entityId);
	if (type === 'series') return text(source.seriesId, source.id, source.entityId);
	if (type === 'heichel') return text(source.heichelId, source.id, source.entityId);
	if (type === 'alias') return text(source.aliasId, source.id, source.entityId);
	return text(source.postId, source.entityId, source.id);
}

function normalizeSocialEntity(input = {}) {
	const source = sourceOf(input);
	const type = inferType(input, source);
	const id = entityId(type, input, source);
	if (!isSocialEntityType(type) || !id) return null;
	return {
		schemaVersion: 1,
		type,
		id,
		heichelId: text(input.heichelId, source.heichelId),
		seriesId: text(input.seriesId, source.seriesId, 'root'),
		postId: text(input.postId, source.postId, type === 'comment' ? input.parentId : ''),
		parentId: text(input.parentId, source.parentId),
		aliasId: text(input.aliasId, source.authorAliasId, source.aliasId),
		contentKind: text(input.contentKind, source.contentType, source.postKind, type),
		presentationKind: text(input.presentationKind, source.presentationKind, type),
		raw: source
	};
}

function entityKey(entity = {}) {
	return [entity.type, entity.heichelId, entity.seriesId, entity.postId, entity.id]
		.filter(Boolean)
		.map(String)
		.join(':');
}

module.exports = { POST_LIKE_HINTS, classifiedType, entityId, entityKey, inferType, normalizeSocialEntity, sourceOf, text };
