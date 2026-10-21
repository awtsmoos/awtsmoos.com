//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsMatchStandalone
 * @description
 * Standalone phrase matching and strict cited-number extraction.
 */

const { NUMBER_MARKERS } = require('./connectionsMatchData.js');
const { hebrewNumeral, tokenNumber, tokenize } = require('./connectionsMatchNumerals.js');

/** @description True when phrase appears with Hebrew-letter boundaries. @param {string} text Haystack. @param {string} phrase Hebrew phrase. @returns {boolean} Match. */
function hasStandalone(text, phrase) {
	const esc = String(phrase).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp('(^|[^א-ת])' + esc + '([^א-ת]|$)').test(String(text));
}

/** @description True when any sefer name matches standalone. @param {string} rest Key remainder after 'sefer:'. @param {string[]} names Sefer names. @returns {boolean} Match. */
function mentionsSeferName(rest, names) {
	return names.some((name) => hasStandalone(rest, name));
}

/**
 * @description Extracts every number the key remainder cites, strictly.
 * Accepted forms: marker+number bigrams (פרק יב, סימן תרב, דף צו), compact
 * perek abbreviations with gershayim (פי״ב, פ״ב, בפי״ב), standalone Arabic
 * digits, and standalone Hebrew numerals ONLY when they carry gershayim/
 * geresh (י״ב) — a bare word like ספר/הזקן/צח is never treated as its
 * gematria value, no matter what it sums to.
 * @param {string} rest Key remainder after 'sefer:'. @returns {Set<number>} Cited numbers.
 */
function extractNumbers(rest) {
	const text = String(rest);
	const found = new Set();
	const abbrevWords = text.match(/[א-תךםןףץ]*[״׳][א-תךםןףץ]*/g) || [];
	for (const word of abbrevWords) {
		const dePre = word.replace(/^[בכלמש]/, '');
		if (!/^פ/.test(dePre)) continue;
		const numeral = dePre.replace(/^פ/, '').replace(/[״׳'"]/g, '');
		const val = numeral && hebrewNumeral(numeral);
		if (val) found.add(val);
	}
	const tokens = tokenize(text);
	for (let i = 0; i < tokens.length; i++) {
		const tok = tokens[i];
		const bare = tok.replace(/^[בכלמ]/, '');
		const marker = NUMBER_MARKERS.includes(tok) || NUMBER_MARKERS.includes(bare);
		if (marker && i + 1 < tokens.length) {
			const val = tokenNumber(tokens[i + 1]);
			if (val) found.add(val);
			continue;
		}
		const stripped = tok.replace(/[׳״'"]/g, '');
		if (/^\d+$/.test(stripped)) {
			// "הערה 15" is a footnote reference, not a chapter/siman citation.
			const prev = i > 0 ? tokens[i - 1].replace(/^[בכלמ]/, '') : '';
			if (!['הערה', 'הערות'].includes(prev)) found.add(parseInt(stripped, 10));
			continue;
		}
		// Standalone Hebrew numeral only with explicit gershayim/geresh.
		if (/[׳״]/.test(tok)) {
			const prev = i > 0 ? tokens[i - 1].replace(/^[בכלמ]/, '') : '';
			if (['הערה', 'הערות'].includes(prev)) continue; // footnote, not a citation
			const val = hebrewNumeral(stripped);
			if (val) found.add(val);
		}
	}
	return found;
}

/**
 * @description True when the key remainder cites the given number.
 * @param {string} rest Key remainder after 'sefer:'. @param {number} num Target number. @returns {boolean} Match.
 */
function mentionsNumber(rest, num) {
	return extractNumbers(rest).has(num);
}

module.exports = {
	hasStandalone,
	mentionsSeferName,
	extractNumbers,
	mentionsNumber
};
