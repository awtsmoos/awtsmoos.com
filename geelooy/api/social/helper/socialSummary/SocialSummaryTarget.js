// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialSummaryTarget
 * @description
 * The Awtsmoos gives one social deed many outward garments; Awtsmoos.com normalizes only proven post-like,
 * question, and answer vessels, refusing explicit foreign entities instead of silently pretending they are posts.
 */
const SUPPORTED_TYPES = new Set(['post', 'question', 'answer']);
const POST_LIKE_WORDS = Object.freeze([
	'post', 'article', 'image', 'audio', 'video', 'story', 'poll', 'live',
	'reference', 'repost', 'share', 'quote'
]);

function text(...values) {
	return values.find(value => typeof value === 'string' && value.trim())?.trim() || '';
}

function sourceOf(input = {}) {
	return input?.source && typeof input.source === 'object' ? input.source : input;
}

function targetType(input = {}, source = sourceOf(input)) {
	const sourceKind = text(source.contentType, source.postKind, source.entityType, source.kind);
	const inputKind = text(input.contentType, input.postKind, input.entityType, input.kind);
	const explicitType = text(input.type).toLowerCase();
	const raw = text(sourceKind, inputKind, explicitType).toLowerCase();
	if (raw.includes('question')) return 'question';
	if (raw.includes('answer')) return 'answer';
	if (POST_LIKE_WORDS.some(word => raw.includes(word))) return 'post';
	if (explicitType && !sourceKind && !inputKind) return explicitType;
	return raw ? 'post' : 'post';
}

function normalizeSummaryTarget(input = {}) {
	const source = sourceOf(input);
	const type = targetType(input, source);
	const id = text(source.postId, source.entityId, source.id, input.postId, input.entityId, input.id);
	const heichelId = text(source.heichelId, source.context?.heichelId, input.heichelId, input.context?.heichelId);
	const seriesId = text(source.seriesId, source.context?.seriesId, input.seriesId, input.context?.seriesId, 'root');
	if (!SUPPORTED_TYPES.has(type) || !id || !heichelId) return null;
	return { type, id, heichelId, seriesId };
}

function summaryTargetKey(target = {}) {
	return [target.type, target.heichelId, target.seriesId || 'root', target.id].join(':');
}

module.exports = {
	POST_LIKE_WORDS,
	SUPPORTED_TYPES,
	normalizeSummaryTarget,
	sourceOf,
	summaryTargetKey,
	targetType,
	text
};
