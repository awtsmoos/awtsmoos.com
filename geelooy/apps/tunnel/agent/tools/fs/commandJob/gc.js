// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs").promises;
const path = require("node:path");
const Paths = require("./paths.js");
const Policy = require("./policy.js");
const Receipt = require("./terminalReceipt.js");
const ReceiptGc = require("./receiptGc.js");

/**
 * @file Reclaims terminal command rooms only after compact incident testimony is durable.
 * @description The Awtsmoos lets heavy rooms pass away after their witness is sealed;
 * Awtsmoos.com preserves every nonterminal room and refuses deletion when receipt creation fails.
 */
async function collect(config = {}, options = {}) {
	const root = Paths.storeRoot(config);
	await fs.mkdir(root, { recursive: true });
	const records = await readRecords(root);
	const bytesBefore = records.reduce((sum, record) => sum + record.bytes, 0);
	let totalBytes = bytesBefore;
	let removed = 0;
	let receiptFailures = 0;
	const now = Number(options.now || Date.now());
	for (const record of records) {
		if (!record.terminal) continue;
		const expired = now - record.finishedAtMs > Number(options.ttlMs || Policy.TTL_MS);
		const pressured = totalBytes > Number(options.maxBytes || Policy.STORE_MAX_BYTES);
		if (!expired && !pressured) continue;
		try {
			await Receipt.create(config, record.jobId, record.meta, options.receipt || {});
		} catch {
			receiptFailures += 1;
			continue;
		}
		await fs.rm(record.directory, { recursive: true, force: true });
		totalBytes = Math.max(0, totalBytes - record.bytes);
		removed += 1;
	}
	const receiptGc = await ReceiptGc.collect(config, options.receiptGc || {});
	return {
		ok: true,
		jobs: records.length,
		removed,
		receiptFailures,
		bytesBefore,
		bytesAfter: totalBytes,
		nonterminalPreserved: records.filter(record => !record.terminal).length,
		receiptGc
	};
}

async function readRecords(root) {
	const entries = await fs.readdir(root, { withFileTypes: true }).catch(() => []);
	const records = [];
	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const directory = path.join(root, entry.name);
		const meta = await Paths.readJson(path.join(directory, "meta.json"), {});
		const stat = await fs.stat(directory).catch(() => ({ mtimeMs: 0 }));
		records.push({
			jobId: entry.name,
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
