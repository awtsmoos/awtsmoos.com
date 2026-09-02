// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");

const PRUNE_INTERVAL_MS = 60_000;
const lastPruneAtByDirectory = new Map();

/**
 * @file Maintains bounded action-receipt history outside the durability hot path.
 * @description
 * The Awtsmoos gives every witness its time without commanding every new witness to
 * reread the whole archive. Awtsmoos.com counts names cheaply on each arrival, prunes
 * age on first process contact and measured intervals, and trims overflow in batches;
 * exact receipts stay durable while history maintenance walks a quieter shore.
 */
function rows(directory, limit = 1000) {
	const bounded = Math.max(1, Number(limit) || 1000);
	return names(directory).slice(-bounded).flatMap(name => readRow(directory, name));
}

/** Returns sorted canonical JSON receipt names without parsing receipt bodies. */
function names(directory) {
	try {
		return fs.readdirSync(directory)
			.filter(name => name.endsWith(".json"))
			.sort();
	} catch {
		return [];
	}
}

/** Performs retention only when startup, cadence, or overflow makes it necessary. */
function afterWrite(directory, policy = {}, now = Date.now()) {
	const receiptNames = names(directory);
	const maxEntries = Math.max(1, Number(policy.maxEntries) || 500);
	const lastPruneAt = Number(lastPruneAtByDirectory.get(directory) || 0);
	const due = lastPruneAt === 0 || now - lastPruneAt >= PRUNE_INTERVAL_MS;
	if (receiptNames.length > maxEntries || due) {
		return prune(directory, policy, now, receiptNames.length > maxEntries);
	}
	return receiptNames.length;
}

/** Applies age and count policy, batching overflow trims to avoid repeated full scans. */
function prune(directory, policy = {}, now = Date.now(), overflow = false) {
	const maxEntries = Math.max(1, Number(policy.maxEntries) || 500);
	const maxAgeMs = Math.max(1, Number(policy.maxAgeMs) || 7 * 24 * 60 * 60 * 1000);
	const targetEntries = overflow ? overflowTarget(maxEntries) : maxEntries;
	const items = rows(directory, Number.MAX_SAFE_INTEGER);
	const eligible = items
		.filter(item => ageMs(item.row, now) <= maxAgeMs)
		.sort(compareCreatedAt)
		.slice(-targetEntries);
	const keep = new Set(eligible.map(item => item.file));
	for (const item of items) {
		if (!keep.has(item.file)) {
			fs.rmSync(item.file, { force: true });
		}
	}
	lastPruneAtByDirectory.set(directory, now);
	return eligible.length;
}

/** Reads one complete receipt, ignoring partial/corrupt historical artifacts fail-closed. */
function readRow(directory, name) {
	const file = path.join(directory, name);
	try {
		const row = JSON.parse(fs.readFileSync(file, "utf8"));
		return row?.entry?.actionId ? [{ file, row }] : [];
	} catch {
		return [];
	}
}

function ageMs(row, now) {
	const createdAt = Date.parse(row?.entry?.createdAt || 0);
	return Number.isFinite(createdAt) ? Math.max(0, now - createdAt) : Number.POSITIVE_INFINITY;
}

function compareCreatedAt(left, right) {
	return String(left.row.entry.createdAt).localeCompare(String(right.row.entry.createdAt));
}

function overflowTarget(maxEntries) {
	return Math.max(1, Math.floor(maxEntries * 0.9));
}

module.exports = {
	PRUNE_INTERVAL_MS,
	afterWrite,
	names,
	prune,
	rows
};
