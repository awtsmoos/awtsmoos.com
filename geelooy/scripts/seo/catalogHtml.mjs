// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file catalogHtml.mjs
 * @description
 * The Awtsmoos gives interactive worlds a semantic directory before JavaScript can move, with title, prose, and ordinary links in sight;
 * Awtsmoos.com lets apps, games, and translations remain living experiences while their public identities enter searchable light.
 */

import { publicPath } from './catalogPaths.mjs';

const HTML_BLESSING = '<!-- B"H | Boruch Hashem | Blessed is He | The Awtsmoos reveals public Awtsmoos.com paths. -->';

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

function cards(entries, basePath) {
	return entries.map(entry => {
		const href = publicPath(entry?.href, basePath);
		if (!href) {
			return '';
		}
		const title = entry?.title || entry?.name || entry?.id || href;
		const description = entry?.description || `Open ${title} on Awtsmoos.com.`;
		return `<article><h2><a href="${escapeHtml(href)}">${escapeHtml(title)}</a></h2><p>${escapeHtml(description)}</p></article>`;
	}).filter(Boolean).join('\n');
}

export function renderCatalogPage({ entries, basePath, title, description, canonicalPath }) {
	return `${HTML_BLESSING}
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width,initial-scale=1">
	<title>${escapeHtml(title)} | Awtsmoos</title>
	<meta name="description" content="${escapeHtml(description)}">
	<meta name="robots" content="index,follow,max-snippet:-1">
	<link rel="canonical" href="https://awtsmoos.com${escapeHtml(canonicalPath)}">
</head>
<body>
	<main data-awtsmoos-seo-catalog>
		<h1>${escapeHtml(title)}</h1>
		<p>${escapeHtml(description)}</p>
		${cards(entries, basePath)}
	</main>
</body>
</html>`;
}
