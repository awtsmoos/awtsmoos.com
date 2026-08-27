// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookChapterRenderer
 * @description Each teaching becomes a print chapter while source and translation remain visibly distinct.
 */
const { alignSections } = require('./alignment.js');
const { safeInline, escape } = require('./html.js');
const { groupByVerse } = require('./translationText.js');

function originalBody(sections) {
	return sections.map(section => {
		const text = section.segments.map(segment => safeInline(segment.text)).join(' ');
		return `<section class="verse original"><p>${text}</p></section>`;
	}).join('\n');
}

function englishBody(translations) {
	return groupByVerse(translations).map(group => {
		const text = group.entries.map(entry => safeInline(entry.text)).join(' ');
		return `<section class="verse translation"><p>${text}</p></section>`;
	}).join('\n');
}

function bilingualBody(original, translations) {
	const aligned = alignSections(original, translations);
	const sections = aligned.sections.map(section => {
		const segments = section.segments.map(segment => {
			const english = segment.english.map(entry => safeInline(entry.text)).join(' ');
			const translation = english
				? `<p class="translation">${english}</p>`
				: '<p class="translation"><em>English translation not yet available for this passage.</em></p>';
			return `<div class="bilingual-segment"><p class="original">${safeInline(segment.text)}</p>${translation}</div>`;
		}).join('\n');
		return `<section class="verse">${segments}</section>`;
	}).join('\n');
	const unpaired = aligned.unpaired.length
		? `<section class="verse translation"><h3>Additional aligned translation</h3><p>${aligned.unpaired.map(entry => safeInline(entry.text)).join(' ')}</p></section>`
		: '';
	return `${sections}${unpaired}`;
}

function renderChapter(chapter, language) {
	let body = '';
	if (language === 'english') body = englishBody(chapter.translations);
	if (language === 'original') body = originalBody(chapter.original);
	if (language === 'bilingual') body = bilingualBody(chapter.original, chapter.translations);
	return `
<article class="chapter" id="${escape(chapter.anchor)}">
	<h2>${escape(chapter.label)}</h2>
	<p class="chapter-meta">${escape(chapter.seriesName)} · <span class="source-id">${escape(chapter.postId)}</span></p>
	${body}
</article>`;
}

module.exports = {
	bilingualBody,
	englishBody,
	originalBody,
	renderChapter
};
