//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RichPostOptions
 * @description The Awtsmoos lets question law, creator metadata, internal copy provenance, and asset summary share one bounded vessel;
 * Awtsmoos.com keeps enrichment separate so source identity can be remembered without becoming destination or author itself.
 */
const { attachmentSummary } = require('./AttachmentSchema.js');
const { normalizeCreatorMetadata } = require('./CreatorMetadataSchema.js');
const { normalizeInternalCloneSource } = require('./InternalCloneSourceSchema.js');
const { normalizeSourceProvenance } = require('./SourceProvenanceSchema.js');
const { cleanText } = require('./TextSanitizer.js');

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
	return {
		answersEnabled: cleanBoolean(item.answersEnabled, true),
		answerPolicy: ANSWER_POLICIES.includes(item.answerPolicy) ? item.answerPolicy : 'open',
		answerGuidance: cleanText(item.answerGuidance || item.guidance, 1200),
		acceptedAnswerId: cleanText(item.acceptedAnswerId, 160)
	};
}

function richOptions(body, kind, rootDocument, rootAssets, summary) {
	const question = kind === 'question'
		? normalizeQuestionOptions(body.questionOptions || body.question)
		: null;
	return {
		richSocialVersion: 2,
		rootDocument,
		summary,
		question,
		creator: normalizeCreatorMetadata(body.creatorMetadata || body.options?.creator),
		cloneSource: normalizeInternalCloneSource(body.cloneSource || body.options?.cloneSource),
		sourceProvenance: normalizeSourceProvenance(body.sourceProvenance || body.options?.sourceProvenance),
		attachmentSummary: attachmentSummary(rootAssets)
	};
}

module.exports = {
	ANSWER_POLICIES,
	cleanBoolean,
	normalizeQuestionOptions,
	richOptions
};
