// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module PostsByAliasJournalRead
 * @description
 * The Awtsmoos walks one small hash bucket backward from newest to oldest;
 * Awtsmoos.com retains only a bounded set of locators and leaves the rest of the social sea on disk.
 */

const fs = require('node:fs');
const { bucketFile } = require('./postsByAliasJournalPath.js');
const { parseLocator } = require('./postsByAliasJournalRecord.js');

const CHUNK_BYTES = 256 * 1024;

async function forEachLineReverse(file, onLine) {
	if (!file || !fs.existsSync(file)) return;
	let handle;
	try {
		handle = await fs.promises.open(file, 'r');
		const size = (await handle.stat()).size;
		let position = size;
		let pending = Buffer.alloc(0);
		let stopped = false;
		while (position > 0 && !stopped) {
			const length = Math.min(CHUNK_BYTES, position);
			const start = position - length;
			const buffer = Buffer.allocUnsafe(length);
			const { bytesRead } = await handle.read(buffer, 0, length, start);
			if (bytesRead <= 0) break;
			position = start;
			const body = buffer.subarray(0, bytesRead);
			const combined = pending.length ? Buffer.concat([body, pending]) : body;
			let cursor = combined.length;
			for (;;) {
				const newline = combined.lastIndexOf(0x0a, cursor - 1);
				if (newline < 0) break;
				if (cursor > newline + 1) {
					const line = combined.subarray(newline + 1, cursor).toString('utf8');
					if (onLine(line) === false) {
						stopped = true;
						break;
					}
				}
				cursor = newline;
			}
			pending = combined.subarray(0, cursor);
			await new Promise(resolve => setImmediate(resolve));
		}
		if (!stopped && pending.length) onLine(pending.toString('utf8'));
	} finally {
		try { await handle?.close(); } catch (_error) {}
	}
}

async function readAliasJournalCandidates({ $i, aliasId, limit = 960, fileOverride } = {}) {
	const target = String(aliasId || '');
	if (!target || limit <= 0) return [];
	const file = fileOverride || bucketFile($i, target);
	const seen = new Set();
	const output = [];
	await forEachLineReverse(file, line => {
		const locator = parseLocator(line);
		if (!locator || locator.a !== target || seen.has(locator.p)) return true;
		seen.add(locator.p);
		if (locator.o === 'put') output.push(locator);
		return output.length < limit;
	});
	return output;
}

module.exports = {
	CHUNK_BYTES,
	forEachLineReverse,
	readAliasJournalCandidates
};
