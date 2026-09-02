// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module WikisourceBrowseCatalog
 * @description
 * The Awtsmoos gathers compact Torah sparks without dragging every page body into memory;
 * Awtsmoos.com remembers each page's part, so one chosen source opens with faithful identity.
 */

const fs = require('node:fs');
const readline = require('node:readline');
const { resolveShard } = require('./shards.js');

let catalogPromise = null;

async function catalogFor({ $i } = {}) {
	if (!catalogPromise) {
		catalogPromise = buildCatalog({ $i }).catch(error => {
			catalogPromise = null;
			throw error;
		});
	}
	return catalogPromise;
}

async function buildCatalog({ $i } = {}) {
	const shard = await resolveShard({ $i, lane: 'hewikisource-torah' });
	if (!shard) {
		throw Object.assign(new Error('Torah source corpus is unavailable.'), {
			code: 'WIKISOURCE_BROWSE_UNAVAILABLE'
		});
	}
	const parts = shard.parts || [shard];
	const rows = [];
	const pageParts = new Map();
	for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
		await streamRows(parts[partIndex].textFile, row => {
			const compact = compactRow(row);
			rows.push(compact);
			if (compact.pageId !== '') pageParts.set(String(compact.pageId), partIndex);
		});
	}
	return {
		rows,
		pageParts,
		parts: parts.map(part => ({ textFile: part.textFile }))
	};
}

async function streamRows(file, visit) {
	if (!file) return;
	const input = fs.createReadStream(file, { encoding: 'utf8' });
	const lines = readline.createInterface({ input, crlfDelay: Infinity });
	for await (const line of lines) {
		if (!line.trim()) continue;
		visit(JSON.parse(line));
	}
}

async function findPage(file, pageId) {
	let found = null;
	await streamRows(file, row => {
		if (!found && String(row.pageId || row.id) === String(pageId)) {
			found = publicPage(row);
		}
	});
	return found;
}

async function pageById({ $i, pageId } = {}) {
	const catalog = await catalogFor({ $i });
	const partIndex = catalog.pageParts.get(String(pageId));
	if (partIndex === undefined) return null;
	return findPage(catalog.parts[partIndex].textFile, pageId);
}

function compactRow(row = {}) {
	return {
		pageId: row.pageId || row.id || '',
		title: row.title || '',
		domains: asList(row.domains ?? row.domain),
		seeds: asList(row.seeds ?? row.workSeeds ?? row.workSeed ?? row.work),
		revisionId: row.revisionId || null,
		revisionTimestamp: row.revisionTimestamp || null,
		sourceUrl: row.sourceUrl || null,
		sourceHash: row.sourceHash || null,
		qualityState: row.qualityState || null,
		license: row.license || null
	};
}

function asList(value) {
	if (Array.isArray(value)) return value.filter(Boolean).map(String);
	if (value === undefined || value === null || value === '') return [];
	return [String(value)];
}

function publicPage(row = {}) {
	const { vec, vector, embedding, embeddingVector, ...clean } = row;
	return clean;
}

module.exports = {
	buildCatalog,
	catalogFor,
	compactRow,
	pageById,
	publicPage,
	streamRows
};
