// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file semantic.js
 * @description
 * The Awtsmoos turns stored names into safe visible meaning before the browser wakes;
 * Awtsmoos.com lets crawlers, readers, and no-JS souls see canonical Torah titles while untrusted marks remain escaped from injection flame.
 */

const { canonicalSeriesTitle } = require('./torahSemanticPresentation.js');

/**
 * Converts stored text or light markup into compact plain text.
 * @param {*} value Source value from public Heichel or series metadata.
 * @returns {string} Normalized plain text.
 */
function toPlainText(value) {
	return String(value == null ? '' : value)
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
 * Normalizes the existing series API response without inventing a second storage contract.
 * @param {*} response Existing series API response.
 * @param {string} seriesId Requested series identifier.
 * @returns {object|null} Normalized series metadata or null when unavailable.
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
 * Builds one escaped semantic model while resolving Ikar titles through the shared browser registry.
 * @param {object} options Semantic source options.
 * @returns {Promise<object>} Safe semantic document fields.
 */
async function buildSemanticModel({ heichel, series, heichelId, seriesId = '' }) {
	const heichelName = toPlainText(heichel?.name || heichel?.title || heichelId || 'Geelooy Heichel');
	const rawSeriesName = toPlainText(series?.name || series?.title || series?.id || seriesId);
	const canonicalSeriesName = series
		? await canonicalSeriesTitle(heichelId, series?.id || seriesId, rawSeriesName)
		: '';
	const seriesName = toPlainText(canonicalSeriesName);
	const heading = seriesName || heichelName;
	const description = toPlainText(series?.description || heichel?.description)
		|| `Explore ${heading} on Awtsmoos.com.`;
	const author = toPlainText(series?.author || heichel?.author);
	const path = seriesName
		? `/heichelos/${encodeURIComponent(heichelId)}/series/${encodeURIComponent(seriesId)}`
		: `/heichelos/${encodeURIComponent(heichelId)}`;
	return {
		pageTitle: escapeHtml(seriesName ? `${seriesName} | ${heichelName} | Awtsmoos` : `${heichelName} | Awtsmoos`),
		description: escapeHtml(description),
		heading: escapeHtml(heading),
		context: escapeHtml(seriesName ? heichelName : 'Living Heichel'),
		author: escapeHtml(author),
		canonicalPath: escapeHtml(path),
		hasSeries: Boolean(seriesName)
	};
}

module.exports = {
	buildSemanticModel,
	escapeHtml,
	normalizeSeries,
	toPlainText
};
