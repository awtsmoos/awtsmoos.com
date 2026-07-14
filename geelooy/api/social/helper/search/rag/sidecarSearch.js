// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SidecarTextSearch
 * @description
 * A JSONL text mirror is streamed one row at a time. Vector arrays are removed before
 * parsing, so ordinary text search stays bounded in memory and avoids database locks.
 */

const fs = require('fs');
const readline = require('readline');
const { publicHit, publicRow } = require('./resultShape.js');

async function searchSidecar({
	file,
	queryText,
	queryTokens,
	relevance,
	limit,
	shard
}) {
	const top = [];
	let scanned = 0;
	let invalid = 0;
	const lines = readline.createInterface({
		input: fs.createReadStream(file, { encoding: 'utf8' }),
		crlfDelay: Infinity
	});
	for await (const line of lines) {
		if (!line.trim()) continue;
		scanned += 1;
		const row = parseRow(line);
		if (!row) {
			invalid += 1;
			continue;
		}
		const score = relevance(row, queryText, queryTokens);
		if (score <= 0) continue;
		insertTop(top, {
			score,
			row: publicRow({
				...row,
				sourceLabel: row.sourceLabel || shard.title,
				vectorDimensions: Number(row.dimensions || shard.dimensions || 0)
			})
		}, limit);
	}
	return {
		hits: top.map((item, index) => publicHit({
			rank: index + 1,
			score: item.score,
			percent: Math.min(100, item.score * 100),
			row: item.row
		}, index)),
		totalRows: Number(shard.count || scanned),
		scannedRows: scanned,
		invalidRows: invalid,
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
	return line.replace(
		/,"(?:vec|vector|embedding)":\[[^\]]*\](?=,|})/g,
		''
	);
}

function insertTop(top, item, limit) {
	top.push(item);
	top.sort((left, right) => right.score - left.score);
	if (top.length > limit) top.length = limit;
}

module.exports = {
	parseRow,
	searchSidecar,
	stripVectors
};
