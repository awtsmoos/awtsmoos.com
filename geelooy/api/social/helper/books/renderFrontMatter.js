// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookFrontMatter
 * @description Title, coverage truth, and a navigable publishing index precede every generated volume.
 */
const { escape } = require('./html.js');

function languageLabel(language) {
	if (language === 'english') return 'English translation';
	if (language === 'original') return 'Original text';
	return 'Original text with English translation';
}

function toc(chapters = []) {
	const items = chapters.map(chapter => (
		`<li><a href="#${escape(chapter.anchor)}"><span>${escape(chapter.label)}</span></a></li>`
	)).join('\n');
	return `<h2>Contents</h2><ol class="toc">${items}</ol>`;
}

function coverageNotice(model) {
	if (model.options.language === 'original') return '';
	const missing = model.missing.length;
	if (!missing) {
		return `<p class="notice">English translation coverage in this generated volume: ${model.chapters.length} of ${model.totalPosts} source teachings included.</p>`;
	}
	return `<p class="notice">This English edition includes ${model.chapters.length} of ${model.totalPosts} source teachings. ${missing} source teaching${missing === 1 ? '' : 's'} currently have no registered English translation and are listed in the appendix rather than fabricated.</p>`;
}

function renderFrontMatter(model) {
	const generated = new Date(model.generatedAt).toISOString().slice(0, 10);
	return `
<section class="title-page">
	<div>
		<h1>${escape(model.title)}</h1>
		<p class="subtitle">${escape(languageLabel(model.options.language))}</p>
		<p class="subtitle">Print edition generated ${escape(generated)}</p>
	</div>
</section>
<section class="front-matter">
	<h2>About this edition</h2>
	<p>This book was assembled from the canonical Awtsmoos.com series and translation APIs. Source order and translation coordinates are preserved.</p>
	${coverageNotice(model)}
	${toc(model.chapters)}
</section>`;
}

module.exports = {
	coverageNotice,
	languageLabel,
	renderFrontMatter,
	toc
};
