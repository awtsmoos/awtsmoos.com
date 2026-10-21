//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module connectionsMatchNumerals
 * @description
 * Hebrew numeral conversion, tokenization and Tanya part hints for citation matching.
 */

const { TANYA_PART_HINTS, PHRASE_RE_CACHE, HEBREW_VALUES } = require('./connectionsMatchData.js');

/** @description Resolves which Tanya series a citation key means (default 'la'). @param {string} rest Key remainder. @returns {string} Series code. */
function tanyaSeriesHint(rest) {
	for (const hint of TANYA_PART_HINTS) {
		if (hint.names.some((name) => phraseRe(name).test(rest))) return hint.series;
	}
	return 'la'; // Unqualified "תניא פרק N" means Likutei Amarim.
}
/** @description Standalone-phrase regex, cached. @param {string} phrase Hebrew phrase. @returns {RegExp} Regex. */
function phraseRe(phrase) {
	let re = PHRASE_RE_CACHE.get(phrase);
	if (!re) {
		re = new RegExp('(^|[^א-ת])(' + phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')([^א-ת]|$)');
		PHRASE_RE_CACHE.set(phrase, re);
	}
	return re;
}

/** @description Converts a Hebrew-letter token to its gematria value. @param {string} token Token with geresh/gershayim stripped. @returns {number|null} Value or null. */
function hebrewNumeral(token) {
	const clean = String(token).replace(/[׳״'"]/g, '');
	if (!/^[א-תךםןףץ]+$/.test(clean)) return null;
	let value = 0;
	for (const ch of clean) value += HEBREW_VALUES[ch] || 0;
	return value > 0 ? value : null;
}

/** @description Numeric value of a token: Arabic digits or Hebrew numeral. @param {string} token Raw token. @returns {number|null} Value or null. */
function tokenNumber(token) {
	const t = String(token).replace(/[׳״'"]/g, '');
	if (/^\d+$/.test(t)) return parseInt(t, 10);
	return hebrewNumeral(t);
}

/** @description Splits text into word tokens on whitespace/punctuation. @param {string} text Input. @returns {string[]} Tokens. */
function tokenize(text) {
	return String(text).split(/[\s:׃.,;״׳'"()\[\]{}|/\\\-–—־‐\n\r\t]+/).filter(Boolean);
}

module.exports = {
	tanyaSeriesHint,
	phraseRe,
	hebrewNumeral,
	tokenNumber,
	tokenize
};
