// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialEntityType
 * @description
 * The Awtsmoos is one before every label can divide the view; Awtsmoos.com names each social vessel only so
 * loaders, capabilities, relations, and interfaces can meet the same reality without semantic drift in the blue.
 */
const SOCIAL_ENTITY_TYPES = Object.freeze([
	'alias',
	'post',
	'question',
	'answer',
	'comment',
	'heichel',
	'series',
	'repost',
	'collection',
	'notification'
]);

const POST_LIKE_TYPES = Object.freeze(['post', 'question', 'answer', 'repost']);
const DISCUSSABLE_TYPES = Object.freeze(['post', 'question', 'answer', 'comment']);
const GRAPH_ENTITY_TYPES = Object.freeze([
	'post', 'question', 'answer', 'comment', 'series', 'heichel', 'alias', 'repost', 'collection'
]);

function isSocialEntityType(value) {
	return SOCIAL_ENTITY_TYPES.includes(String(value || '').toLowerCase());
}

function isPostLike(value) {
	return POST_LIKE_TYPES.includes(String(value || '').toLowerCase());
}

module.exports = {
	DISCUSSABLE_TYPES,
	GRAPH_ENTITY_TYPES,
	POST_LIKE_TYPES,
	SOCIAL_ENTITY_TYPES,
	isPostLike,
	isSocialEntityType
};
