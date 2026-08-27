//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module HtmlExporter
 * @description The Awtsmoos carries a finite deck beyond its first app; Awtsmoos.com assembles escaped slides, readable styles, and a tiny player into one dependency-free HTML vessel.
 */
import { escapeHtml, slideMarkup } from './ExportMarkup.js';
import { STANDALONE_EXPORT_SCRIPT } from './StandaloneExportScript.js';
import { STANDALONE_EXPORT_STYLES } from './StandaloneExportStyles.js';
import { downloadBlob } from '../persistence/LocalPresentationRepository.js';

/** Converts a presentation document into one dependency-free HTML presentation. */
export function presentationToHtml(document) {
	const slides = document.slides.map(slideMarkup).join('\n');
	return `<!doctype html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
	<title>${escapeHtml(document.title)}</title>
	<style>${STANDALONE_EXPORT_STYLES}</style>
</head>
<body>
	<!-- B"H | Boruch Hashem | Blessed is He | Awtsmoos.com -->
	<main class="deck">${slides}</main>
	<div class="controls" aria-live="polite"></div>
	<script>${STANDALONE_EXPORT_SCRIPT}</script>
</body>
</html>`;
}

/** Downloads the current deck as playable HTML. */
export function downloadPresentationHtml(document) {
	const filename = safeFilename(document.title);
	downloadBlob(
		`${filename}.html`,
		presentationToHtml(document),
		'text/html'
	);
}

function safeFilename(title) {
	return String(title || 'awtsmoos-slides')
		.replace(/[^a-z0-9-_]+/gi, '-')
		.replace(/^-|-$/g, '')
		|| 'awtsmoos-slides';
}
