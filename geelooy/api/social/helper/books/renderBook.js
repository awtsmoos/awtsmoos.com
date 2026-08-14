// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PrintableBookRenderer
 * @description A standalone HTML codex carries its own print law, contents, chapters, and source index.
 */
const { escape } = require('./html.js');
const { printCss } = require('./printCss.js');
const { renderFrontMatter } = require('./renderFrontMatter.js');
const { renderChapter } = require('./renderChapter.js');

function sourceIndex(model) {
	const rows = model.chapters.map((chapter, index) => (
		`<li>${index + 1}. ${escape(chapter.label)} — <span class="source-id">${escape(chapter.postId)}</span></li>`
	)).join('\n');
	return `<section class="index"><h2>Source index</h2><ol>${rows}</ol></section>`;
}

function missingAppendix(model) {
	if (!model.missing.length) return '';
	const rows = model.missing.map(item => (
		`<li><span class="source-id">${escape(item.postId)}</span>${item.seriesName ? ` — ${escape(item.seriesName)}` : ''}</li>`
	)).join('\n');
	return `<section class="missing-appendix"><h2>English translation coverage appendix</h2><p>The following source teachings were present in the selected series but had no registered English translation when this edition was generated.</p><ul>${rows}</ul></section>`;
}

function renderBook(model) {
	const chapters = model.chapters.map(chapter => renderChapter(chapter, model.options.language)).join('\n');
	return `<!doctype html>
<html lang="${model.options.language === 'original' ? 'he' : 'en'}">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escape(model.title)}</title>
	<style>${printCss(model.options.fontPt)}</style>
</head>
<body>
<main>
${renderFrontMatter(model)}
${chapters}
${sourceIndex(model)}
${missingAppendix(model)}
</main>
</body>
</html>`;
}

module.exports = {
	missingAppendix,
	renderBook,
	sourceIndex
};
