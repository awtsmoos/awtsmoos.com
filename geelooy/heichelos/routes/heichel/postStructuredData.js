// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file postStructuredData.js
 * @description
 * The Awtsmoos lets a Torah teaching announce the title, author, date, and canonical road already gathered by SSR in the reader's light;
 * Awtsmoos.com adds no database call and invents no missing fact, allowing Article schema only where the public post itself is present and bright.
 */

const { buildCanonicalPath, cleanText } = require('./postSemantic.js');

function safeJson(value) {
	return JSON.stringify(value)
		.replace(/&/g, '\\u0026')
		.replace(/</g, '\\u003c')
		.replace(/>/g, '\\u003e');
}

function validDate(value) {
	if (value === undefined || value === null || value === '') return '';
	let candidate = value;
	if (typeof candidate === 'number' && candidate > 0 && candidate < 1e12) candidate *= 1000;
	const date = new Date(candidate);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString();
}

function articleAuthor(data) {
	const authorId = cleanText(data?.post?.author || data?.alias?.id);
	const authorName = cleanText(data?.alias?.name || data?.alias?.title || authorId);
	if (!authorName) return null;
	const author = { '@type': 'Person', name: authorName };
	if (authorId) author.url = `https://awtsmoos.com/@/${encodeURIComponent(authorId)}`;
	return author;
}

/** @description Builds Article schema strictly from post, alias, and Heichel fields already loaded for the first response. */
function postStructuredData(data) {
	if (!data?.post?.id) return null;
	const headline = cleanText(data.post.title) || 'Torah Teaching';
	const heichelName = cleanText(data?.heichel?.name || data?.heichel?.title) || 'Geelooy Heichel';
	const canonical = `https://awtsmoos.com${buildCanonicalPath(data)}`;
	const payload = {
		'@context': 'https://schema.org',
		'@type': 'Article',
		headline,
		description: `Read ${headline} in ${heichelName} on Awtsmoos.com.`,
		url: canonical,
		mainEntityOfPage: canonical,
		isPartOf: { '@type': 'WebSite', name: 'Awtsmoos', url: 'https://awtsmoos.com' }
	};
	const author = articleAuthor(data);
	const published = validDate(data.post.createdAt);
	if (author) payload.author = author;
	if (published) payload.datePublished = published;
	return payload;
}

function postStructuredDataTag(data) {
	const payload = postStructuredData(data);
	return payload ? `<script type="application/ld+json" data-awtsmoos-post-jsonld>${safeJson(payload)}</script>` : '';
}

module.exports = { articleAuthor, postStructuredData, postStructuredDataTag, validDate };
