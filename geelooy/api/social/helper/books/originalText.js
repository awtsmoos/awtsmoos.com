// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookOriginalText
 * @description One normalized coordinate model receives arrays-of-phrases and structured Meluket segments.
 */
function textOf(value) {
	if (typeof value === 'string') return value;
	if (!value || typeof value !== 'object') return '';
	return value.content || value.text || value.html || '';
}

function phraseSections(sections) {
	return sections.map((section, verseIndex) => {
		const phrases = Array.isArray(section) ? section : [section];
		return {
			verse: String(verseIndex),
			segments: phrases
				.map((phrase, subIndex) => ({
					verse: String(verseIndex),
					sub: subIndex,
					text: textOf(phrase)
				}))
				.filter(segment => segment.text)
		};
	}).filter(section => section.segments.length);
}

function structuredSections(sections) {
	return sections.map((section, sectionIndex) => {
		const verse = String(section?.verseSection ?? sectionIndex);
		const sourceSegments = Array.isArray(section?.segments) && section.segments.length
			? section.segments
			: [section];
		const segments = sourceSegments.map((segment, segmentIndex) => ({
			verse,
			sub: Number(segment?.options?.sourceSubsection ?? segment?.order ?? segmentIndex),
			text: textOf(segment)
		})).filter(segment => segment.text);
		return { verse, segments };
	}).filter(section => section.segments.length);
}

function contentSections(content) {
	return String(content || '')
		.split(/\n\s*\n+/)
		.map(value => value.trim())
		.filter(Boolean)
		.map((text, index) => ({
			verse: String(index),
			segments: [{ verse: String(index), sub: 0, text }]
		}));
}

function normalizeOriginal(post = {}) {
	const dayuhSections = post?.dayuh?.sections;
	if (Array.isArray(dayuhSections) && dayuhSections.length) {
		return phraseSections(dayuhSections);
	}
	if (Array.isArray(post.sections) && post.sections.length) {
		return structuredSections(post.sections);
	}
	return contentSections(post.content || post.rootContent || '');
}

function segmentCount(sections = []) {
	return sections.reduce((total, section) => total + section.segments.length, 0);
}

module.exports = {
	contentSections,
	normalizeOriginal,
	phraseSections,
	segmentCount,
	structuredSections
};
