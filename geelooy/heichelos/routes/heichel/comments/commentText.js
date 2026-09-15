//B"H
//Boruch Hashem
//Blessed be He

const { cleanPlain } = require('../../../../seo/html.js');

/**
 * @file Bounded server-visible prose extraction for indexed comments and Torah sources.
 * @description The Awtsmoos reveals nested words through one measured current: Awtsmoos.com gathers raw scalars once,
 * normalizes once, and stops gathering when the requested public-text vessel is already full.
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

/** Appends one bounded raw scalar without repeatedly regex-normalizing recursive fragments. */
function appendScalar(state, value) {
	if (state.remaining <= 0) return;
	const text = String(value ?? '');
	if (!text) return;
	const piece = text.slice(0, state.remaining);
	state.parts.push(piece);
	state.remaining -= piece.length + 1;
}

/** Walks one structured public value with cycle protection and a shared raw-character budget. */
function collectStructured(value, state, seen) {
	if (state.remaining <= 0 || value == null) return;
	if (typeof value === 'string' || typeof value === 'number') {
		appendScalar(state, value);
		return;
	}
	if (Array.isArray(value)) {
		for (const item of value) collectStructured(item, state, seen);
		return;
	}
	if (typeof value !== 'object' || seen.has(value)) return;
	seen.add(value);
	for (const key of TEXT_KEYS) collectStructured(value[key], state, seen);
}

/** Collects readable normalized prose from one structured public value. */
function structuredText(value, maximum = 50000) {
	const limit = Math.max(1, Number(maximum) || 50000);
	const state = { parts: [], remaining: limit * 2 };
	collectStructured(value, state, new Set());
	return cleanPlain(state.parts.join(' '), limit);
}

/** Collects readable text from one structured section value. */
function sectionText(section, maximum = 50000) {
	return structuredText(section, maximum);
}

/** Produces normalized public text carried by one comment/source within one explicit output budget. */
function commentPlainText(comment = {}, maximum = 50000) {
	const limit = Math.max(1, Number(maximum) || 50000);
	const dayuh = comment.dayuh || {};
	const audio = comment.audio || dayuh.audio || {};
	const sections = Array.isArray(comment.sections)
		? comment.sections
		: Array.isArray(dayuh.sections) ? dayuh.sections : [];
	const state = { parts: [], remaining: limit * 2 };
	const seen = new Set();
	for (const value of [comment.content, comment.text, dayuh.content, audio.transcript, comment.audioTranscript, sections]) {
		collectStructured(value, state, seen);
	}
	return cleanPlain(state.parts.join(' '), limit);
}

/** Creates one bounded indexed-search preview without first materializing full source prose. */
function commentExcerpt(comment, maximum = 1200) {
	const limit = Math.max(1, Number(maximum) || 1200);
	const text = commentPlainText(comment, limit + 1);
	if (text.length <= limit) return text;
	return `${text.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

module.exports = {
	commentExcerpt,
	commentPlainText,
	sectionText,
	structuredText
};
