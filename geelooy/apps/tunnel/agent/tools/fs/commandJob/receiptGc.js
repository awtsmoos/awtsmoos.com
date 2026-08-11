// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const ReceiptPaths = require("./receiptPaths.js");
const Policy = require("./receiptPolicy.js");
const Receipt = require("./terminalReceipt.js");

const fsp = fs.promises;

/**
 * @file Bounds compact terminal receipts without touching live or full command rooms.
 * @description The Awtsmoos grants incident testimony a longer horizon but still a measured vessel;
 * Awtsmoos.com removes the oldest compact witnesses only after age or receipt-store pressure requires it.
 */
async function collect(config = {}, options = {}) {
	const root = ReceiptPaths.receiptRoot(config);
	const ttlMs = bounded(options.ttlMs, Policy.TTL_MS);
	const maxBytes = bounded(options.maxBytes, Policy.STORE_MAX_BYTES);
	const now = Number(options.now || Date.now());
	const records = await recordsAt(root);
	let totalBytes = records.reduce((sum, record) => sum + record.bytes, 0);
	let removed = 0;
	for (const record of records) {
		const expired = now - record.finishedAt > ttlMs;
		const pressured = totalBytes > maxBytes;
		if (!expired && !pressured) continue;
		await fsp.rm(record.file, { force: true });
		totalBytes = Math.max(0, totalBytes - record.bytes);
		removed += 1;
	}
	return { ok: true, scanned: records.length, removed, totalBytes, ttlMs, maxBytes };
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

function bounded(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = { collect, recordsAt };
