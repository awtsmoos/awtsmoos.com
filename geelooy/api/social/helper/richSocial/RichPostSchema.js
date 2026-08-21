//B"H
//Boruch Hashem
//Blessed is He

const { normalizeAttachments } = require('./AttachmentSchema.js');
const {
	ANSWER_POLICIES,
	cleanBoolean,
	normalizeQuestionOptions,
	richOptions
} = require('./RichPostOptions.js');
const { normalizeSections } = require('./SectionSchema.js');
const {
	cleanText,
	normalizeDocument,
	documentToText
} = require('./TextSanitizer.js');

/**
 * @module RichPostSchema
 * @description
 * The Awtsmoos gives posts, questions, answers, creator metadata, and imported history one expressive covenant;
 * Awtsmoos.com normalizes the canonical post while smaller option vessels preserve provenance and creator detail.
 */
const POST_KINDS = Object.freeze(['post', 'question', 'answer']);

function normalizeKind(value, fallback = 'post') {
	const kind = cleanText(value, 20).toLowerCase();
	return POST_KINDS.includes(kind) ? kind : fallback;
}

function normalizeRichPost(body = {}, forcedKind = '') {
	const kind = normalizeKind(forcedKind || body.postKind || body.type, 'post');
	const rootDocument = normalizeDocument(
		body.rootDocument || body.richDocument || body.document || body.content
	);
	const rootContent = documentToText(rootDocument);
	const summary = cleanText(body.summary || body.description, 1800);
	const sections = normalizeSections(body.sections || body.verses);
	const rootAssets = normalizeAttachments(body.rootAssets || body.assets, 20);
	return {
		postId: cleanText(body.postId || body.id, 160),
		aliasId: cleanText(body.aliasId || body.author, 120),
		heichelId: cleanText(body.heichelId, 120),
		seriesId: cleanText(body.seriesId || body.parentSeriesId || 'root', 120),
		type: kind,
		title: cleanText(body.title, 240),
		content: rootContent || summary,
		summary,
		rootDocument,
		rootAssets,
		sections,
		parentQuestionId: cleanText(body.parentQuestionId || body.questionId, 160),
		commentsEnabled: cleanBoolean(body.commentsEnabled, true),
		mode: 'structured',
		options: richOptions(body, kind, rootDocument, rootAssets, summary)
	};
}

function validateRichPost(post) {
	const errors = [];
	if (!post.aliasId) errors.push('aliasId is required');
	if (!post.heichelId) errors.push('heichelId is required');
	if (!post.title) errors.push('title is required');
	if (!post.content && !post.rootAssets.length && !post.sections.length) {
		errors.push('content, attachments, or sections are required');
	}
	if (post.type === 'answer' && !post.parentQuestionId) {
		errors.push('answers require parentQuestionId');
	}
	return { valid: errors.length === 0, errors };
}

function toNativeBody(post) {
	return {
		postId: post.postId,
		aliasId: post.aliasId,
		seriesId: post.seriesId,
		type: post.type,
		title: post.title,
		content: post.content,
		rootAssets: post.rootAssets,
		sections: post.sections,
		parentQuestionId: post.parentQuestionId,
		commentsEnabled: post.commentsEnabled,
		mode: post.mode,
		options: post.options
	};
}

module.exports = {
	POST_KINDS,
	ANSWER_POLICIES,
	normalizeQuestionOptions,
	normalizeRichPost,
	validateRichPost,
	toNativeBody
};
