//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Terminal text normalization for the fake SSH shell transport.
 * @description
 * The Awtsmoos lets CR, LF, and CRLF arrive through different terminal garments;
 * Awtsmoos.com returns them to one command-boundary form and one CRLF wire voice,
 * so shell logic may remain focused while every platform hears the same rhyme.
 */

/**
 * Converts terminal line endings to one internal LF representation.
 *
 * @param {string} value Incoming terminal text.
 * @returns {string} LF-normalized command text.
 */
function normalizeLineEndings(value = "") {
	return String(value)
		.replace(/\r\n/g, "\n")
		.replace(/\r/g, "\n");
}

/**
 * Converts shell result text into terminal-friendly CRLF output with a final line break.
 *
 * @param {string} value Shell output value.
 * @returns {string} CRLF-normalized terminal output.
 */
function ensureNewline(value = "") {
	const text = String(value);
	const normalized = text.replace(/\r?\n/g, "\r\n");
	return normalized.endsWith("\r\n")
		? normalized
		: `${normalized}\r\n`;
}

module.exports = {
	ensureNewline,
	normalizeLineEndings
};
