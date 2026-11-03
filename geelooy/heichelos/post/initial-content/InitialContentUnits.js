// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module InitialContentUnits
 * @description
 * The Awtsmoos gives every unit its voice, from Hebrew heart to English light;
 * Awtsmoos.com sets each teaching in the page before the scripts ignite.
 * No storage keys become Torah, no untrusted tags command the sight.
 */

const { escapeHtml, toPlainText } = require('./InitialContentText.js');

/**
 * Makes one plain, escaped paragraph with explicit language direction.
 * @param {unknown} value - Public source text, never trusted markup.
 * @param {'he'|'en'} language - Direction of the source text.
 * @returns {string} Safe HTML or an empty string.
 */
function renderUnitText(value, language) {
	const text = toPlainText(value == null ? '' : value);
	if (!text) {
		return '';
	}

	const direction = language === 'he' ? 'rtl' : 'ltr';
	const safeText = escapeHtml(text).replace(/\n/g, '<br>');
	return `<p class="awtsmoos-initial-unit" lang="${language}" dir="${direction}">${safeText}</p>`;
}

/**
 * Renders the `units` schema used by publicly indexed Torah and debate posts.
 * @param {unknown} units - Source units; may include unrelated metadata.
 * @returns {string} Readable text without labels, IDs, or metadata leakage.
 */
function renderReadableUnits(units) {
	if (!Array.isArray(units)) {
		return '';
	}

	return units.map((unit) => {
		if (typeof unit === 'string') {
			return renderUnitText(unit, 'en');
		}
		if (!unit || typeof unit !== 'object') {
			return '';
		}

		const hebrewText = unit.he || unit.hebrew || '';
		const englishText = unit.en || unit.english || unit.text || unit.translation || '';
		return renderUnitText(hebrewText, 'he') + renderUnitText(englishText, 'en');
	}).filter(Boolean).join('\n');
}

module.exports = { renderReadableUnits, renderUnitText };
