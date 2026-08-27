//B"H
//Boruch Hashem
//Blessed is He

const {
	CREATOR_DISTRIBUTION_FIELDS,
	normalizeCreatorDistribution
} = require('./CreatorDistributionSchema.js');
const {
	CREATOR_SOCIAL_FIELDS,
	normalizeSocialMetadata
} = require('./CreatorSocialMetadataSchema.js');
const { cleanText, cleanUrl } = require('./TextSanitizer.js');

/**
 * @module CreatorMetadataSchema
 * @description
 * The Awtsmoos lets creator, social, and distribution knowledge travel with the post;
 * Awtsmoos.com bounds tags, collaborators, place, transcript, chapters, attribution, and nested platform-era detail.
 */
const CREATOR_METADATA_FIELDS = Object.freeze([
	'intent',
	'tags',
	'collaborators',
	'location',
	'language',
	'thumbnailUrl',
	'transcript',
	'captionLanguages',
	'chapters',
	'license',
	'attribution',
	'social',
	'distribution'
]);

function parse(value) {
	if (!value) return {};
	if (typeof value === 'object') return value;
	try {
		return JSON.parse(value);
	} catch {
		return {};
	}
}

function cleanList(value, maximum, itemMaximum) {
	const values = Array.isArray(value)
		? value
		: String(value || '').split(',');
	return [...new Set(values
		.slice(0, maximum)
		.map(item => cleanText(item, itemMaximum))
		.filter(Boolean))];
}

function normalizeCollaborators(value) {
	if (!Array.isArray(value)) return [];
	return value.slice(0, 24).map(item => {
		const source = typeof item === 'string' ? { aliasId: item } : (item || {});
		return {
			aliasId: cleanText(source.aliasId || source.id, 120),
			role: cleanText(source.role || 'collaborator', 80)
		};
	}).filter(item => item.aliasId);
}

function normalizeChapters(value) {
	if (!Array.isArray(value)) return [];
	return value.slice(0, 100).map(item => ({
		startSeconds: Math.max(
			0,
			Math.min(86400, Number(item?.startSeconds || item?.start || 0))
		),
		title: cleanText(item?.title || item?.label, 180)
	})).filter(item => item.title);
}

function normalizeCreatorMetadata(value = {}) {
	const item = parse(value);
	return {
		intent: cleanText(item.intent, 40),
		tags: cleanList(item.tags, 40, 80),
		collaborators: normalizeCollaborators(item.collaborators),
		location: cleanText(item.location, 240),
		language: cleanText(item.language, 40),
		thumbnailUrl: cleanUrl(item.thumbnailUrl || item.thumbnail),
		transcript: cleanText(item.transcript, 24000),
		captionLanguages: cleanList(item.captionLanguages, 24, 40),
		chapters: normalizeChapters(item.chapters),
		license: cleanText(item.license, 120),
		attribution: cleanText(item.attribution, 600),
		social: normalizeSocialMetadata(item.social || {}),
		distribution: normalizeCreatorDistribution(item.distribution || {})
	};
}

module.exports = {
	CREATOR_METADATA_FIELDS,
	CREATOR_SOCIAL_FIELDS,
	CREATOR_DISTRIBUTION_FIELDS,
	normalizeCreatorMetadata,
	normalizeCollaborators,
	normalizeChapters,
	cleanList
};
