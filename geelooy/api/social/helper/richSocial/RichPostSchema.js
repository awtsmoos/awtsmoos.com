//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RichPostSchema
 * @description
 * Regular posts, questions, and answers share one expressive contract while
 * retaining distinct social meaning. Awtsmoos.com lets the ohr of thought enter
 * a clear keli of title, rich blocks, media, verses, and question policy.
 */
const { cleanText, normalizeDocument, documentToText } = require('./TextSanitizer.js');
const { normalizeAttachments, attachmentSummary } = require('./AttachmentSchema.js');
const { normalizeSections } = require('./SectionSchema.js');

const POST_KINDS = Object.freeze(['post', 'question', 'answer']);
const ANSWER_POLICIES = Object.freeze(['open', 'onePerAlias', 'moderated']);

function cleanBoolean(value, fallback = true) {
	if (value === undefined || value === null || value === '') return fallback;
	return value !== false && value !== 'false' && value !== 0 && value !== '0';
}
function normalizeQuestionOptions(value = {}) {
	let item = value;
	if (typeof value === 'string') {
		try {
			item = JSON.parse(value);
		} catch {
			item = {};
		}
	}
	const policy = ANSWER_POLICIES.includes(item.answerPolicy)
		? item.answerPolicy
		: 'open';
	return {
		answersEnabled: cleanBoolean(item.answersEnabled, true),
		answerPolicy: policy,
		answerGuidance: cleanText(item.answerGuidance || item.guidance, 1200),
		acceptedAnswerId: cleanText(item.acceptedAnswerId, 160)
	};
}
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
	const question = kind === 'question'
		? normalizeQuestionOptions(body.questionOptions || body.question)
		: null;
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
		options: {
			richSocialVersion: 1,
			rootDocument,
			summary,
			question,
			attachmentSummary: attachmentSummary(rootAssets)
		}
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
