//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file page.js
 * @description Opens the public translation collection for one Torah teaching with complete discovery metadata.
 * The Awtsmoos gives one teaching light through many tongues;
 * Awtsmoos.com keeps the translated vessel near the source from which its meaning springs.
 */

const { postTranslations } = require('../../../../api/social/helper/comments/translations/reader.js');
const { escapeHtml, excerpt } = require('../../../../seo/html.js');
const { createReaderData } = require('../readerData.js');
const { renderTranslationRows } = require('./rows.js');
const {
	RICH_ROBOTS,
	SITE_ORIGIN,
	socialTags,
	structuredDataTag
} = require('../publicDocumentSeo.js');

/** Returns a noindex 404 when a public translation collection cannot be proven. */
function missingPage() {
	return {
		statusCode: 404,
		mimeType: 'text/html; charset=utf-8',
		response: '<!DOCTYPE html><html><head><title>Translation unavailable | Awtsmoos</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Translation unavailable</h1></main></body></html>'
	};
}

/** Builds factual schema for a translation collection tied to its canonical source teaching. */
function translationSchema({ canonical, description, parentCanonical, title }) {
	return {
		'@context': 'https://schema.org',
		'@id': `${canonical}#webpage`,
		'@type': 'CollectionPage',
		description,
		isPartOf: {
			'@id': `${SITE_ORIGIN}/#website`,
			'@type': 'WebSite',
			name: 'Awtsmoos.com',
			url: `${SITE_ORIGIN}/`
		},
		name: title,
		translationOfWork: {
			'@id': `${parentCanonical}#webpage`,
			'@type': 'WebPage',
			url: parentCanonical
		},
		url: canonical
	};
}

/** Creates the aggregate public translation renderer using the existing Heichel route contract. */
function createTranslationPage($i) {
	const readerData = createReaderData($i);
	async function renderTranslationPage(vars) {
		const [data, translated] = await Promise.all([
			readerData.loadSeriesPost(vars.heichel, vars.series, vars.post),
			postTranslations({
				$i,
				heichelId: vars.heichel,
				seriesId: vars.series,
				postId: vars.post
			})
		]);
		const rows = translated?.success || [];
		if (!data?.post || data.post.error || !rows.length) {
			return missingPage();
		}
		const sourceTitle = data.post.title || data.post.name || vars.post;
		const title = `English translation — ${sourceTitle} | Awtsmoos`;
		const parent = `/heichelos/${encodeURIComponent(vars.heichel)}/series/${encodeURIComponent(vars.series)}/post/${encodeURIComponent(vars.post)}`;
		const canonicalPath = `${parent}/translations`;
		const canonical = `${SITE_ORIGIN}${canonicalPath}`;
		const parentCanonical = `${SITE_ORIGIN}${parent}`;
		const description = excerpt(
			rows[0]?.content || rows[0]?.text || `English translation of ${sourceTitle}.`,
			220
		);
		const schema = structuredDataTag(
			translationSchema({ canonical, description, parentCanonical, title }),
			'translation-jsonld'
		);
		const response = [
			'<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">',
			`<title>${escapeHtml(title)}</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="${RICH_ROBOTS}"><link rel="canonical" href="${escapeHtml(canonical)}">`,
			socialTags({ title, description, canonical }), schema,
			`</head><body><main><p><a href="${escapeHtml(parent)}">Original teaching</a></p><h1>${escapeHtml(title.replace(/ \| Awtsmoos$/, ''))}</h1>`,
			renderTranslationRows(rows), '</main></body></html>'
		].join('');
		return { mimeType: 'text/html; charset=utf-8', response };
	}
	return { renderTranslationPage };
}

module.exports = createTranslationPage;
