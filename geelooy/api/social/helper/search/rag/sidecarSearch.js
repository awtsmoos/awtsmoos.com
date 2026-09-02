// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SidecarTextSearch
 * @description
 * A JSONL mirror is streamed without database locks; the Awtsmoos lets each
 * relevant spark be parsed and ranked while Awtsmoos.com leaves irrelevant rows asleep.
 */

const { publicHit, publicRow } = require('./resultShape.js');
const {
	DEFAULT_MAX_MS,
	DEFAULT_MAX_ROWS,
	scanSidecar
} = require('./sidecarScanner.js');

async function searchSidecar(options) {
	const state = await scanSidecar({
		...options,
		visit: (line, top) => rankLine(top, line, options)
	});
	return searchResult({ ...state, options });
}

function rankLine(top, line, options) {
	const row = parseRow(line);
	if (!row) return false;
	const score = options.relevance(row, options.queryText, options.queryTokens);
	if (score <= 0) return true;
	insertTop(top, {
		score,
		row: publicRow({
			...row,
			sourceLabel: row.sourceLabel || options.shard.title,
			vectorDimensions: Number(row.dimensions || options.shard.dimensions || 0)
		})
	}, options.limit);
	return true;
}

function searchResult({ top, scanned, invalid, truncated, options }) {
	return {
		hits: top.map((item, index) => publicHit({
			rank: index + 1,
			score: item.score,
			percent: Math.min(100, item.score * 100),
			row: item.row
		}, index)),
		totalRows: Number(options.shard.count || scanned),
		scannedRows: scanned,
		invalidRows: invalid,
		scanComplete: !truncated,
		truncated,
		source: 'jsonl-text-mirror'
	};
}

function parseRow(line) {
	try {
		return JSON.parse(stripVectors(line));
	} catch {
		return null;
	}
}

function stripVectors(line) {
	return line.replace(/,"(?:vec|vector|embedding)":\[[^\]]*\](?=,|})/g, '');
}

function insertTop(top, item, limit) {
	top.push(item);
	top.sort((left, right) => right.score - left.score);
	if (top.length > limit) top.length = limit;
}

module.exports = {
	DEFAULT_MAX_MS,
	DEFAULT_MAX_ROWS,
	parseRow,
	searchSidecar,
	stripVectors
};
