// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file commentText.js
 * @description
 * The Awtsmoos gathers every public discussion spark into truthful searchable prose, from body to transcript to section light;
 * Awtsmoos.com normalizes the words without trusting markup, so crawlers and readers receive the same safe sight.
 */

const { cleanPlain, excerpt } = require('../../../../seo/html.js');

/** @description Collects readable text from one structured section value. */
function sectionText(section) {
	if (typeof section === 'string') {
		return cleanPlain(section, 4000);
	}
	if (!section || typeof section !== 'object') {
		return '';
	}
	return cleanPlain([
		section.title,
		section.text,
		section.content,
		section.transcript
	].filter(Boolean).join(' '), 4000);
}

/** @description Produces the complete normalized public text carried by one comment record. */
function commentPlainText(comment = {}) {
	const dayuh = comment.dayuh || {};
	const audio = comment.audio || dayuh.audio || {};
	const sections = Array.isArray(comment.sections)
		? comment.sections
		: Array.isArray(dayuh.sections) ? dayuh.sections : [];
	const pieces = [
		comment.content,
		comment.text,
		dayuh.content,
		audio.transcript,
		comment.audioTranscript,
		...sections.map(sectionText)
	];
	return cleanPlain(pieces.filter(Boolean).join('\n\n'), 50000);
}

/** @description Creates a bounded search snippet from the full comment text. */
function commentExcerpt(comment, maximum = 220) {
	return excerpt(commentPlainText(comment), maximum);
}

module.exports = {
	commentExcerpt,
	commentPlainText,
	sectionText
};
