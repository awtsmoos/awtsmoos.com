// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SidecarScanner
 * @description
 * The Awtsmoos lets a vast Torah mirror stream as light instead of weight;
 * Awtsmoos.com rejects impossible raw rows before costly parsing seals their fate.
 */

const fs = require('fs');
const readline = require('readline');
const { performance } = require('perf_hooks');

const DEFAULT_MAX_ROWS = 8000;
const DEFAULT_MAX_MS = 3500;
const DEFAULT_MIN_ROWS = 512;
const HEBREW_TOKEN = /^[\p{Script=Hebrew}\p{N}]+$/u;

async function scanSidecar(options) {
	const limits = searchLimits(options);
	const exactNeedle = exactTitleNeedle(options.exactTitle);
	const rawTokens = safeRawTokens(options.queryTokens);
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
			const candidate = exactNeedle
				? line.includes(exactNeedle)
				: rawMayMatch(line, rawTokens);
			if (candidate && options.visit(line, top) === false) invalid += 1;
			if (exactNeedle && top.length) {
				truncated = true;
				break;
			}
			if (shouldStop({ scanned, startedAt, top, limits })) {
				truncated = true;
				break;
			}
		}
	} finally {
		lines.close();
		input.destroy();
	}
	return { top, scanned, invalid, truncated };
}

function searchLimits(options) {
	return {
		maxRows: positive(options.maxRows, DEFAULT_MAX_ROWS),
		maxMs: positive(options.maxMs, DEFAULT_MAX_MS),
		minRows: positive(options.minRows, DEFAULT_MIN_ROWS)
	};
}

function safeRawTokens(queryTokens = []) {
	const values = queryTokens.filter(Boolean).map(String);
	if (!values.length) return [];
	if (values.some(token => token.length < 2 || !HEBREW_TOKEN.test(token))) return [];
	return values;
}

function rawMayMatch(line, rawTokens) {
	return !rawTokens.length || rawTokens.some(token => line.includes(token));
}

function exactTitleNeedle(title) {
	return title ? `"title":${JSON.stringify(String(title))}` : '';
}

function shouldStop({ scanned, startedAt, top, limits }) {
	if (scanned >= limits.maxRows) return true;
	if (scanned < limits.minRows || !top.length) return false;
	return performance.now() - startedAt >= limits.maxMs;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

module.exports = {
	DEFAULT_MAX_MS,
	DEFAULT_MAX_ROWS,
	exactTitleNeedle,
	rawMayMatch,
	safeRawTokens,
	scanSidecar
};
