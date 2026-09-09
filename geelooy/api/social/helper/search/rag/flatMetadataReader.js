// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module FlatMetadataReader
 * @description
 * The Awtsmoos lets the temporary legacy metadata river flow one line at a time while only requested rows are remembered;
 * Awtsmoos.com forbids corpus-sized metadata arrays even before the sidecar itself is retired into native AwtsmoosDB.
 */

const fs = require('fs');
const readline = require('readline');

/** Parses one legacy row during migration without retaining its neighbors. */
function parseLegacyRow(line, rowIndex) {
	try {
		return JSON.parse(line);
	} catch (error) {
		throw new Error(`flat_metadata_parse_failed:${rowIndex}`);
	}
}

/**
 * Reads only selected metadata rows from a line-aligned legacy sidecar.
 * @param {string} file Legacy metadata path.
 * @param {Set<number>} wanted Row indexes required by the top-k result page.
 * @returns {Promise<Map<number,object>>} Selected rows keyed by exact matrix index.
 */
async function selectedMetadata(file, wanted) {
	const found = new Map();
	if (!wanted.size) return found;
	const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
	let rowIndex = 0;
	for await (const line of lines) {
		if (!line.trim()) continue;
		if (wanted.has(rowIndex)) found.set(rowIndex, parseLegacyRow(line, rowIndex));
		rowIndex += 1;
		if (found.size === wanted.size) break;
	}
	lines.close();
	return found;
}

/**
 * Reads at most limit leading metadata rows for diagnostics without materializing the corpus.
 * @param {string} file Legacy metadata path.
 * @param {number} limit Maximum rows retained.
 * @returns {Promise<{rows:Array<object>,totalSeen:number,truncated:boolean}>} Bounded diagnostic page.
 */
async function leadingMetadata(file, limit) {
	const rows = [];
	const lines = readline.createInterface({ input: fs.createReadStream(file, 'utf8'), crlfDelay: Infinity });
	let totalSeen = 0;
	for await (const line of lines) {
		if (!line.trim()) continue;
		if (rows.length < limit) rows.push(parseLegacyRow(line, totalSeen));
		totalSeen += 1;
		if (rows.length >= limit + 1) break;
		if (totalSeen > limit) break;
	}
	lines.close();
	return {
		rows: rows.slice(0, limit),
		totalSeen,
		truncated: totalSeen > limit
	};
}

module.exports = { leadingMetadata, selectedMetadata };
