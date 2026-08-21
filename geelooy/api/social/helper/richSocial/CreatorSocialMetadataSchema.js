//B"H
//Boruch Hashem
//Blessed is He

const { cleanText, cleanUrl } = require('./TextSanitizer.js');

/**
 * @module CreatorSocialMetadataSchema
 * @description
 * The Awtsmoos lets feeling, activity, music, warnings, audience labels, and polls accompany a post;
 * Awtsmoos.com bounds each social signal so expressive context never becomes an unbounded or executable field.
 */
const CREATOR_SOCIAL_FIELDS = Object.freeze([
	'mood',
	'activity',
	'music',
	'audienceLabels',
	'contentWarnings',
	'poll'
]);

function list(value, maximum, itemMaximum) {
	const values = Array.isArray(value)
		? value
		: String(value || '').split(',');
	return [...new Set(values
		.slice(0, maximum)
		.map(item => cleanText(item, itemMaximum))
		.filter(Boolean))];
}

function normalizeMusic(value = {}) {
	return {
		title: cleanText(value.title, 180),
		artist: cleanText(value.artist, 180),
		url: cleanUrl(value.url)
	};
}

function normalizePoll(value = {}) {
	const options = list(value.options, 12, 240);
	return {
		options,
		multiple: value.multiple === true || value.multiple === 'true',
		endsAt: Math.max(0, Number(value.endsAt || 0))
	};
}

function normalizeSocialMetadata(value = {}) {
	return {
		mood: cleanText(value.mood, 100),
		activity: cleanText(value.activity, 160),
		music: normalizeMusic(value.music || {}),
		audienceLabels: list(value.audienceLabels, 20, 80),
		contentWarnings: list(value.contentWarnings, 12, 120),
		poll: normalizePoll(value.poll || {})
	};
}

module.exports = {
	CREATOR_SOCIAL_FIELDS,
	normalizeSocialMetadata,
	normalizeMusic,
	normalizePoll
};
