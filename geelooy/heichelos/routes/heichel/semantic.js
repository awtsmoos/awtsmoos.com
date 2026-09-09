//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Semantic shell truth for server-first Heichel pages.
 * @description
 * The Awtsmoos turns stored names into safe visible meaning before the browser
 * wakes. Awtsmoos.com resolves canonical Torah titles from route identity even
 * when optional metadata is absent, and rejects sentinel text such as undefined
 * rather than printing storage failure into public Torah pages.
 */

const { canonicalSeriesTitle } = require('./torahSemanticPresentation.js');

/**
 * Converts stored text or light markup into compact truthful plain text.
 * @param {*} value Public metadata value.
 * @returns {string} Safe normalized text or an empty string for sentinel values.
 */
function toPlainText(value) {
	const text = String(value == null ? '' : value)
		.replace(/<br\s*\/?>/gi, ' ')
		.replace(/<[^>]*>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;|&apos;/gi, "'")
		.replace(/\s+/g, ' ')
		.trim();
	return /^(?:undefined|null|nan)$/i.test(text) ? '' : text;
}

/** Returns the first meaningful public text value without leaking sentinels. */
function firstPlainText(...values) {
	for (const value of values) {
		const text = toPlainText(value);
		if (text) {
			return text;
		}
	}
	return '';
}

/** Escapes plain text for safe insertion into HTML text or quoted attributes. */
function escapeHtml(value) {
	return String(value == null ? '' : value)
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

/**
 * Normalizes the existing series API response without inventing a storage contract.
 */
function normalizeSeries(response, seriesId) {
	if (!response || response.error) {
		return null;
	}
	const source = response.prateem && typeof response.prateem === 'object'
		? response.prateem
		: response;
	return {
		...source,
		id: source.id || response.id || seriesId
	};
}

/**
 * Builds one escaped semantic model from route identity and optional metadata.
 * @param {object} options Semantic source options.
 * @returns {Promise<object>} Safe server-first document fields.
 */
async function buildSemanticModel({ heichel, series, heichelId, seriesId = '' }) {
	const heichelName = firstPlainText(
		heichel?.name,
		heichel?.title,
		heichelId,
		'Geelooy Heichel'
	);
	const hasSeriesIdentity = Boolean(seriesId && seriesId !== 'root');
	const seriesIdentity = String(series?.id || seriesId || '');
	const rawSeriesName = firstPlainText(series?.name, series?.title, seriesIdentity);
	const canonicalSeriesName = hasSeriesIdentity
		? await canonicalSeriesTitle(heichelId, seriesIdentity, rawSeriesName)
		: '';
	const seriesName = toPlainText(canonicalSeriesName);
	const heading = seriesName || heichelName;
	const description = firstPlainText(series?.description, heichel?.description)
		|| `Explore ${heading} on Awtsmoos.com.`;
	const author = firstPlainText(series?.author, heichel?.author);
	const canonicalPath = seriesName
		? `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`
		: `/heichelos/${encodeURIComponent(heichelId)}`;
	return {
		pageTitle: escapeHtml(seriesName ? `${seriesName} | ${heichelName} | Awtsmoos` : `${heichelName} | Awtsmoos`),
		description: escapeHtml(description),
		heading: escapeHtml(heading),
		context: escapeHtml(seriesName ? heichelName : 'Living Heichel'),
		author: escapeHtml(author),
		canonicalPath: escapeHtml(canonicalPath),
		hasSeries: Boolean(seriesName)
	};
}

module.exports = {
	buildSemanticModel,
	escapeHtml,
	firstPlainText,
	normalizeSeries,
	toPlainText
};
