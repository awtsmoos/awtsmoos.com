// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Retention = require("../../../lib/history/retentionPlan.js");
const ReceiptPaths = require("./receiptPaths.js");
const Policy = require("./receiptPolicy.js");
const Receipt = require("./terminalReceipt.js");

const fsp = fs.promises;

/**
 * @file Reclaims compact command receipts by age, count, or bytes.
 * @description
 * The Awtsmoos leaves useful testimony without demanding an endless archive.
 * Awtsmoos.com applies one retention covenant to every compact witness, so many
 * tiny receipts cannot evade a byte limit by multiplying their number without end.
 */
async function collect(config = {}, options = {}) {
	const root = ReceiptPaths.receiptRoot(config);
	const limits = {
		maxAgeMs: positive(options.ttlMs, Policy.TTL_MS),
		maxRecords: positive(options.maxRecords, Policy.STORE_MAX_RECORDS),
		maxBytes: positive(options.maxBytes, Policy.STORE_MAX_BYTES)
	};
	const records = await recordsAt(root);
	const planned = Retention.plan(records.map(retentionRecord), limits, Number(options.now || Date.now()));
	let removedBytes = 0;
	for (const candidate of planned.remove) {
		await fsp.rm(candidate.record.file, { force: true });
		removedBytes += candidate.record.bytes;
	}
	const bytesBefore = records.reduce((sum, record) => sum + record.bytes, 0);
	return {
		ok: true,
		scanned: records.length,
		removed: planned.remove.length,
		bytesBefore,
		bytesAfter: Math.max(0, bytesBefore - removedBytes),
		limits,
		pressure: planned.pressure
	};
}

function retentionRecord(record) {
	return {
		id: record.file,
		createdAt: record.finishedAt,
		bytes: record.bytes,
		protected: false,
		record
	};
}

async function recordsAt(root) {
	let names = [];
	try {
		names = await fsp.readdir(root);
	} catch (error) {
		if (error.code === "ENOENT") return [];
		throw error;
	}
	const records = [];
	for (const name of names.filter(value => value.endsWith(".json"))) {
		const file = path.join(root, name);
		const stat = await safeStat(file);
		if (!stat?.isFile()) continue;
		let receipt = null;
		try {
			receipt = JSON.parse(await fsp.readFile(file, "utf8"));
		} catch {}
		const finishedAt = Receipt.isTerminalReceipt(receipt)
			? Date.parse(receipt.meta.finishedAt || receipt.createdAt) || stat.mtimeMs
			: stat.mtimeMs;
		records.push({ file, bytes: stat.size, finishedAt });
	}
	return records.sort((left, right) => left.finishedAt - right.finishedAt);
}

async function safeStat(file) {
	try {
		return await fsp.lstat(file);
	} catch (error) {
		if (error.code === "ENOENT") return null;
		throw error;
	}
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { collect, recordsAt, retentionRecord };
