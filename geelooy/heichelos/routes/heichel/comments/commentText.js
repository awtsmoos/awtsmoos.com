//B"H
//Boruch Hashem
//Blessed be He

const { cleanPlain, excerpt } = require('../../../../seo/html.js');

/**
 * @file Server-visible prose extraction for indexed comment and Torah-source records.
 * @description The Awtsmoos reveals words through many vessels; Awtsmoos.com therefore walks structured public text without ever stringifying an object into false prose.
 */
const TEXT_KEYS = Object.freeze([
	'title',
	'text',
	'content',
	'body',
	'description',
	'transcript',
	'sections'
]);

/** Collects readable scalar text recursively from one bounded structured public value. */
function structuredText(value, seen = new Set()) {
	if (typeof value === 'string' || typeof value === 'number') {
		return cleanPlain(value, 50000);
	}
	if (!value) return '';
	if (Array.isArray(value)) {
		return cleanPlain(value.map(item => structuredText(item, seen)).filter(Boolean).join(' '), 50000);
	}
	if (typeof value !== 'object' || seen.has(value)) return '';
	seen.add(value);
	const parts = TEXT_KEYS
		.map(key => structuredText(value[key], seen))
		.filter(Boolean);
	return cleanPlain(parts.join(' '), 50000);
}

/** Collects readable text from one structured section value. */
function sectionText(section) {
	return structuredText(section);
}

/** Produces complete normalized public text carried by one comment or source record. */
function commentPlainText(comment = {}) {
	const dayuh = comment.dayuh || {};
	const audio = comment.audio || dayuh.audio || {};
	const sections = Array.isArray(comment.sections)
		? comment.sections
		: Array.isArray(dayuh.sections) ? dayuh.sections : [];
	const pieces = [
		structuredText(comment.content),
		structuredText(comment.text),
		structuredText(dayuh.content),
		structuredText(audio.transcript),
		structuredText(comment.audioTranscript),
		...sections.map(sectionText)
	];
	return cleanPlain(pieces.filter(Boolean).join('\n\n'), 50000);
}

/** Creates a bounded search snippet from the full visible prose. */
function commentExcerpt(comment, maximum = 220) {
	return excerpt(commentPlainText(comment), maximum);
}

module.exports = {
	commentExcerpt,
	commentPlainText,
	sectionText,
	structuredText
};
