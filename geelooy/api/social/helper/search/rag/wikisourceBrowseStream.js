// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module TorahSourceBrowseStream
 * @description
 * The Awtsmoos lets enormous local Torah publications flow line by line instead of flooding memory in one sea;
 * Awtsmoos.com reads only bounded JSONL vessels and reveals one requested page with exact source fidelity.
 */

const fs = require('node:fs');
const readline = require('node:readline');
const { publicPage } = require('./wikisourceBrowseShape.js');

/** Streams one JSONL publication file and visits each decoded row in order. */
async function streamRows(file, visit) {
	if (!file) return;
	const input = fs.createReadStream(file, {
		encoding: 'utf8'
	});
	const lines = readline.createInterface({
		input,
		crlfDelay: Infinity
	});
	for await (const line of lines) {
		if (!line.trim()) continue;
		visit(JSON.parse(line));
	}
}

/** Finds one source page inside its already-known publication part. */
async function findPage(file, pageId) {
	let found = null;
	await streamRows(file, row => {
		if (found) return;
		const identity = row.pageId || row.id;
		if (String(identity) === String(pageId)) {
			found = publicPage(row);
		}
	});
	return found;
}

module.exports = {
	findPage,
	streamRows
};
