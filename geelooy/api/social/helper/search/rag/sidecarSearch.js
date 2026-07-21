// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SidecarTextSearch
 * @description
 * A JSONL mirror is streamed without database locks, yet no request may devour
 * the whole event loop. The Awtsmoos reveals a bounded window, reports whether
 * the scan completed, and leaves every persisted byte untouched.
 */

const fs = require('fs');
const readline = require('readline');
const { performance } = require('perf_hooks');
const { publicHit, publicRow } = require('./resultShape.js');

const DEFAULT_MAX_ROWS = 8000;
const DEFAULT_MAX_MS = 3500;
const DEFAULT_MIN_ROWS = 512;

async function searchSidecar(options) {
	const limits = searchLimits(options);
	const startedAt = performance.now();
	const top = [];
	let scanned = 0;
	let invalid = 0;
	let truncated = false;
	const input = fs.createReadStream(options.file, { encoding: 'utf8' });
	const lines = readline.createInterface({ input, crlfDelay: Infinity });
	try {
		for await (const line of lines) {
			if (!line.trim()) continue;
			scanned += 1;
			const row = parseRow(line);
			if (!row) invalid += 1;
			else rankRow(top, row, options);
			if (shouldStop({ scanned, startedAt, top, limits })) {
				truncated = true;
				break;
			}
		}
	} finally {
		lines.close();
		input.destroy();
	}
	return searchResult({ top, scanned, invalid, truncated, options });
}

function searchLimits(options) {
	return {
		maxRows: positive(options.maxRows, DEFAULT_MAX_ROWS),
		maxMs: positive(options.maxMs, DEFAULT_MAX_MS),
		minRows: positive(options.minRows, DEFAULT_MIN_ROWS)
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function shouldStop({ scanned, startedAt, top, limits }) {
	if (scanned >= limits.maxRows) return true;
	if (scanned < limits.minRows) return false;
	const enoughHits = top.length > 0;
	return enoughHits && performance.now() - startedAt >= limits.maxMs;
}

function rankRow(top, row, options) {
	const score = options.relevance(row, options.queryText, options.queryTokens);
	if (score <= 0) return;
	insertTop(top, {
		score,
		row: publicRow({
			...row,
			sourceLabel: row.sourceLabel || options.shard.title,
			vectorDimensions: Number(row.dimensions || options.shard.dimensions || 0)
		})
	}, options.limit);
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
