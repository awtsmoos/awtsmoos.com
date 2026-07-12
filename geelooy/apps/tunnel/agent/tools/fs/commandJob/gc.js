// B"H
const fs = require('node:fs').promises;
const path = require('node:path');
const Paths = require('./paths.js');
const Policy = require('./policy.js');

/**
 * B"H — Garbage collection removes only terminal history. Running or ambiguous
 * work survives age and byte pressure so cleanup can reconcile it deliberately.
 */
async function collect(config = {}) {
	const root = Paths.storeRoot(config);
	await fs.mkdir(root, { recursive: true });
	const records = await readRecords(root);
	let totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
	const now = Date.now();
	for (const record of records) {
		if (!record.terminal) continue;
		const expired = now - record.finishedAtMs > Policy.TTL_MS;
		const pressured = totalBytes > Policy.STORE_MAX_BYTES;
		if (!expired && !pressured) continue;
		await fs.rm(record.directory, { recursive: true, force: true });
		totalBytes -= record.bytes;
	}
	return {
		ok: true,
		jobs: records.length,
		bytesBefore: records.reduce((sum, record) => sum + record.bytes, 0),
		bytesAfter: Math.max(0, totalBytes),
		nonterminalPreserved: records.filter(record => !record.terminal).length
	};
}

async function readRecords(root) {
	const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
	const records = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const directory = path.join(root, entry.name);
		const meta = await Paths.readJson(path.join(directory, 'meta.json'), {});
		const stat = await fs.stat(directory).catch(() => ({ mtimeMs: 0 }));
		records.push({
			directory,
			meta,
			terminal: Policy.TERMINAL.has(meta.status),
			finishedAtMs: Date.parse(meta.finishedAt || meta.updatedAt || 0) || stat.mtimeMs,
			bytes: await directoryBytes(directory)
		});
	}
	return records.sort((left, right) => left.finishedAtMs - right.finishedAtMs);
}

async function directoryBytes(directory) {
	let total = 0;
	const entries = await fs.readdir(directory, { withFileTypes: true }).catch(() => []);
	for (const entry of entries) {
		const target = path.join(directory, entry.name);
		if (entry.isDirectory()) total += await directoryBytes(target);
		else total += Number((await fs.stat(target).catch(() => ({ size: 0 }))).size || 0);
	}
	return total;
}

module.exports = { collect, directoryBytes, readRecords };
