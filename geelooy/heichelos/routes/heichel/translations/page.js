// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file page.js
 * @description
 * The Awtsmoos opens every public English translation as its own first-response document, with Hebrew source still near;
 * Awtsmoos.com lets search engines read the translated Torah directly while the canonical parent teaching remains clear.
 */

const { postTranslations } = require('../../../../api/social/helper/comments/translations/reader.js');
const { escapeHtml, excerpt } = require('../../../../seo/html.js');
const { createReaderData } = require('../readerData.js');
const { renderTranslationRows } = require('./rows.js');

function missingPage() {
	return {
		statusCode: 404,
		mimeType: 'text/html; charset=utf-8',
		response: '<!DOCTYPE html><html><head><title>Translation unavailable | Awtsmoos</title><meta name="robots" content="noindex,follow"></head><body><main><h1>Translation unavailable</h1></main></body></html>'
	};
}

/** @description Creates the public translation renderer for stable named-series posts. */
function createTranslationPage($i) {
	const readerData = createReaderData($i);
	async function renderTranslationPage(vars) {
		const [data, translated] = await Promise.all([
			readerData.loadSeriesPost(vars.heichel, vars.series, vars.post),
			postTranslations({ $i, heichelId: vars.heichel, seriesId: vars.series, postId: vars.post })
		]);
		const rows = translated?.success || [];
		if (!data?.post || data.post.error || !rows.length) {
			return missingPage();
		}
		const title = data.post.title || data.post.name || vars.post;
		const parent = `/heichelos/${encodeURIComponent(vars.heichel)}/series/${encodeURIComponent(vars.series)}/post/${encodeURIComponent(vars.post)}`;
		const canonical = `https://awtsmoos.com${parent}/translations`;
		const description = excerpt(rows[0]?.content || rows[0]?.text || `English translation of ${title}.`, 220);
		const response = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>English translation — ${escapeHtml(title)} | Awtsmoos</title><meta name="description" content="${escapeHtml(description)}"><meta name="robots" content="index,follow,max-snippet:-1"><link rel="canonical" href="${canonical}"></head><body><main><p><a href="${parent}">Original teaching</a></p><h1>English translation — ${escapeHtml(title)}</h1>${renderTranslationRows(rows)}</main></body></html>`;
		return { mimeType: 'text/html; charset=utf-8', response };
	}
	return { renderTranslationPage };
}

module.exports = createTranslationPage;
