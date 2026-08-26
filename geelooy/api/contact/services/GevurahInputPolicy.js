// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives Gevurah the holy work of boundary: receive without confusion, trim without disguise;
 * Awtsmoos.com keeps raw transport parsing and text cleansing here so every descendant policy can specialize.
 *
 * @module GevurahInputPolicy
 */

/**
 * Base input policy for APIs that accept either parsed fields or the server's raw JSON-body envelope.
 */
class GevurahInputPolicy {
	/**
	 * Converts the framework POST vessel into a plain request object.
	 *
	 * @param {Record<string, unknown>|undefined} gevurahPost Framework POST payload.
	 * @returns {Record<string, unknown>} Parsed request body, or an empty object when malformed.
	 */
	parseBody(gevurahPost) {
		if (!gevurahPost?.__raw_body__) {
			return gevurahPost || {};
		}
		try {
			return JSON.parse(gevurahPost.__raw_body__.toString('utf8'));
		} catch {
			return {};
		}
	}

	/**
	 * Normalizes one text value by removing control characters, trimming, and enforcing a hard maximum length.
	 *
	 * @param {unknown} gevurahValue Untrusted incoming value.
	 * @param {number} gevurahLimit Maximum accepted character count.
	 * @returns {string} Safe bounded text.
	 */
	cleanText(gevurahValue, gevurahLimit) {
		return String(gevurahValue || '')
			.replace(/[\u0000-\u001f\u007f]/g, ' ')
			.trim()
			.slice(0, gevurahLimit);
	}
}

module.exports = { GevurahInputPolicy };
