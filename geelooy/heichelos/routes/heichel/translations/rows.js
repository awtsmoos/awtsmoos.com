// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file rows.js
 * @description
 * The Awtsmoos lets English translation and Hebrew source stand side by side, two vessels revealing one teaching's light;
 * Awtsmoos.com preserves every public row as escaped semantic prose so translation need not wait for JavaScript sight.
 */

const { escapeHtml } = require('../../../../seo/html.js');

/** @description Resolves a stable semantic identifier for one public translation row. */
function rowId(row, index) {
	return row?.id || row?.commentId || row?.importedCommentId || `translation-${index + 1}`;
}

/** @description Renders one complete English translation row with its Hebrew source context when supplied. */
function renderTranslationRow(row = {}, index = 0) {
	const identifier = escapeHtml(rowId(row, index));
	const english = escapeHtml(row.content || row.text || row.dayuh?.content || '');
	const hebrew = escapeHtml(row.sourceHebrew || row.dayuh?.sourceHebrew || '');
	const source = hebrew ? `<blockquote lang="he" dir="rtl"><p>${hebrew}</p></blockquote>` : '';
	return `<article id="${identifier}" data-awtsmoos-translation-row><h2>English translation ${index + 1}</h2><div lang="en"><p>${english}</p></div>${source}</article>`;
}

/** @description Renders all complete public translation rows as one semantic document fragment. */
function renderTranslationRows(rows = []) {
	return rows.map(renderTranslationRow).join('');
}

module.exports = {
	renderTranslationRow,
	renderTranslationRows,
	rowId
};
