// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs").promises;
const path = require("node:path");
const Retention = require("../../../lib/history/retentionPlan.js");
const Paths = require("./paths.js");
const Policy = require("./policy.js");
const Receipt = require("./terminalReceipt.js");
const ReceiptGc = require("./receiptGc.js");

/**
 * @file Reclaims terminal command rooms by age, count, or bytes after sealing receipts.
 * @description
 * The Awtsmoos preserves every living command while Awtsmoos.com gives terminal
 * rooms three independent horizons. A room is removed only after its compact witness
 * is durable; protected work survives even when remaining pressure must be reported.
 */
async function collect(config = {}, options = {}) {
	const root = Paths.storeRoot(config);
	await fs.mkdir(root, { recursive: true });
	const records = await readRecords(root);
	const limits = {
		maxAgeMs: positive(options.ttlMs, Policy.TTL_MS),
		maxRecords: positive(options.maxRecords, Policy.STORE_MAX_RECORDS),
		maxBytes: positive(options.maxBytes, Policy.STORE_MAX_BYTES)
	};
	const planned = Retention.plan(records.map(retentionRecord), limits, Number(options.now || Date.now()));
	let removed = 0;
	let receiptFailures = 0;
	let removedBytes = 0;
	for (const candidate of planned.remove) {
		const record = candidate.record;
		try {
			await Receipt.create(config, record.jobId, record.meta, options.receipt || {});
		} catch {
			receiptFailures += 1;
			continue;
		}
		await fs.rm(record.directory, { recursive: true, force: true });
		removed += 1;
		removedBytes += record.bytes;
	}
	const bytesBefore = records.reduce((sum, record) => sum + record.bytes, 0);
	const receiptGc = await ReceiptGc.collect(config, options.receiptGc || {});
	return {
		ok: true,
		jobs: records.length,
		removed,
		receiptFailures,
		bytesBefore,
		bytesAfter: Math.max(0, bytesBefore - removedBytes),
		nonterminalPreserved: records.filter(record => !record.terminal).length,
		pressure: planned.pressure,
		limits,
		receiptGc
	};
}

function retentionRecord(record) {
	return {
		id: record.jobId,
		createdAt: record.finishedAtMs,
		bytes: record.bytes,
		protected: !record.terminal,
		record
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

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { collect, directoryBytes, readRecords, retentionRecord };
