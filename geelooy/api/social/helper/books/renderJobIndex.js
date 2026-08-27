// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookJobIndex
 * @description A generated shelf page gives humans one-click access to every finished HTML volume.
 */
const { escape } = require('./html.js');
const { printCss } = require('./printCss.js');

function renderJobIndex(config, books) {
	const rows = books.map(book => (
		`<li><a href="${encodeURIComponent(book.file)}">${escape(book.title)}</a> <span class="source-id">${escape(book.seriesId)}</span></li>`
	)).join('\n');
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<title>${escape(config.seriesId)} — generated books</title>
	<style>${printCss(11)}</style>
</head>
<body><main>
<section class="title-page"><div><h1>Generated book shelf</h1><p class="subtitle">${escape(config.seriesId)} · ${escape(config.options.language)}</p></div></section>
<section><h2>Books</h2><ol>${rows}</ol><p><a href="archive.zip">Download all as ZIP</a></p></section>
</main></body>
</html>`;
}

module.exports = { renderJobIndex };
