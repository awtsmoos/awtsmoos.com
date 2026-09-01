// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WikisourceBrowseCatalog
 * @description
 * The Awtsmoos lets thousands of Torah pages flow as a stream while Awtsmoos.com
 * remembers only the small navigation sparks needed to reveal an honest bookshelf.
 */

const fs = require('node:fs');
const readline = require('node:readline');
const { resolveShard } = require('./shards.js');

let catalogPromise = null;

async function catalogFor({ $i }) {
	if (!catalogPromise) catalogPromise = buildCatalog({ $i });
	return catalogPromise;
}

async function buildCatalog({ $i }) {
	const shard = await resolveShard({ $i, lane: 'hewikisource-torah' });
	if (!shard) throw Object.assign(new Error('Wikisource Torah lane is unavailable.'), {
		code: 'WIKISOURCE_BROWSE_UNAVAILABLE'
	});
	const parts = shard.parts || [shard];
	const rows = [];
	for (const part of parts) {
		await streamRows(part.textFile, row => rows.push(compactRow(row)));
	}
	return {
		rows,
		parts: parts.map(part => ({ textFile: part.textFile }))
	};
}

async function streamRows(file, onRow) {
	if (!file) return;
	const lines = readline.createInterface({
		input: fs.createReadStream(file, { encoding: 'utf8' }),
		crlfDelay: Infinity
	});
	for await (const line of lines) {
		if (!line.trim()) continue;
		onRow(JSON.parse(line));
	}
}

function compactRow(row = {}) {
	return {
		pageId: Number(row.pageId || 0),
		title: String(row.title || ''),
		domains: Array.isArray(row.domains) ? row.domains : [],
		seeds: Array.isArray(row.seeds) ? row.seeds : [],
		revisionId: Number(row.revisionId || 0),
		revisionTimestamp: row.revisionTimestamp || '',
		sourceUrl: row.sourceUrl || '',
		sourceHash: row.sourceHash || '',
		qualityState: row.qualityState || '',
		license: row.license || ''
	};
}

async function pageById({ $i, pageId }) {
	const catalog = await catalogFor({ $i });
	let found = null;
	for (const part of catalog.parts) {
		await streamRows(part.textFile, row => {
			if (!found && Number(row.pageId) === Number(pageId)) found = publicPage(row);
		});
		if (found) break;
	}
	return found;
}

function publicPage(row = {}) {
	const { vec, embedding, vector, ...plain } = row;
	return plain;
}

module.exports = {
	catalogFor,
	compactRow,
	pageById,
	publicPage,
	streamRows
};
