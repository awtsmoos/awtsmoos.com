//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module InteractionSchema
 * @description The Awtsmoos lets a reply carry text, media, URL, canonical source, and semantic relation in one bounded vessel;
 * Awtsmoos.com preserves human meaning without arbitrary HTML while legacy references remain valid when no relation was named.
 */
const {
	clean,
	normalizeTarget,
	validateTarget
} = require('./InteractionTarget.js');
const {
	REFERENCE_RELATIONS,
	normalizeRelation
} = require('./ReferenceRelations.js');

function array(value) {
	if (Array.isArray(value)) return value;
	if (!value) return [];
	try {
		const parsed = JSON.parse(value);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}

function normalizeAsset(value = {}) {
	return {
		id: clean(value.id || value.assetId, 180),
		type: clean(value.type || value.kind, 30),
		mime: clean(value.mime, 100),
		publicPath: clean(value.publicPath || value.url, 700),
		alt: clean(value.alt, 240),
		caption: clean(value.caption, 500),
		role: clean(value.role || 'inline', 40)
	};
}

function normalizeReference(value = {}) {
	return {
		kind: clean(value.kind || 'post', 40),
		type: clean(value.type || value.entityType || 'post', 40),
		id: clean(value.id || value.entityId || value.postId || value.commentId, 180),
		url: clean(value.url, 700),
		heichelId: clean(value.heichelId, 120),
		seriesId: clean(value.seriesId || 'root', 120),
		sectionId: clean(value.sectionId, 120),
		label: clean(value.label || value.title, 240),
		relation: normalizeRelation(value.relation)
	};
}

function usableReference(item) {
	if (item.kind === 'url') return Boolean(item.url);
	return Boolean(item.id && item.heichelId);
}

function normalizeCommentInput(value = {}) {
	const target = normalizeTarget(value.target || value);
	const assets = array(value.assets || value.attachments)
		.map(normalizeAsset)
		.filter(item => item.id || item.publicPath)
		.slice(0, 12);
	const references = array(value.references || value.links)
		.map(normalizeReference)
		.filter(usableReference)
		.slice(0, 12);
	return {
		aliasId: clean(value.aliasId, 120),
		target,
		content: clean(value.content || value.text, 8000),
		audioNoteText: clean(value.audioNoteText || value.transcript, 2000),
		mood: clean(value.mood, 40),
		assets,
		references
	};
}

function validateCommentInput(input) {
	const targetValidation = validateTarget(input.target);
	const errors = [...targetValidation.errors];
	if (!input.aliasId) errors.push('aliasId is required.');
	if (!input.content && !input.audioNoteText && !input.assets.length && !input.references.length) {
		errors.push('Text, media, transcript, or reference is required.');
	}
	return { valid: errors.length === 0, errors, input };
}

function normalizePromotion(value = {}) {
	return {
		aliasId: clean(value.aliasId, 120),
		commentId: clean(value.commentId, 180),
		title: clean(value.title, 240),
		summary: clean(value.summary, 1600),
		heichelId: clean(value.heichelId, 120),
		seriesId: clean(value.seriesId || 'root', 120),
		visibility: ['public', 'unlisted', 'private'].includes(value.visibility) ? value.visibility : 'public',
		idempotencyKey: clean(value.idempotencyKey, 160)
	};
}

module.exports = {
	REFERENCE_RELATIONS,
	array,
	normalizeAsset,
	normalizeCommentInput,
	normalizePromotion,
	normalizeReference,
	normalizeRelation,
	usableReference,
	validateCommentInput
};
