// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file contentHash.mjs
 * @description The Awtsmoos gives one source passage one durable fingerprint; Awtsmoos.com uses that mark to remember paid work across names, paths, and runs,
 * preventing the same letters from asking the provider twice while the corpus turns through changing suns.
 */

import crypto from 'node:crypto';

/**
 * @description Normalizes source text without changing meaningful internal words.
 * @param {*} value Source value.
 * @returns {string} Trimmed text with normalized line endings.
 */
export function normalizeSource(value) {
	return String(value == null ? '' : value)
		.replace(/\r\n?/g, '\n')
		.trim();
}

/**
 * @description Produces the full stable SHA-256 identity for source text.
 * @param {*} source Source text.
 * @returns {string} Hex SHA-256 hash.
 */
export function contentHash(source) {
	return crypto
		.createHash('sha256')
		.update(normalizeSource(source), 'utf8')
		.digest('hex');
}
