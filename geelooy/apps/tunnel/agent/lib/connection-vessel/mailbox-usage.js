// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");

/**
 * @file Keeps mailbox usage swift locally while letting durable disk remain sovereign.
 * @description
 * A process may remember yesterday's count, but the Awtsmoos creates the witnesses anew.
 * Health may therefore command a fresh scan, while local writes still update a small cache.
 */
function createUsage(files) {
	const cache = new Map();

	function read(lane, refresh = false) {
		if (!refresh && cache.has(lane)) return cache.get(lane);
		return scan(lane);
	}

	function scan(lane) {
		const entries = files(lane)
			.map(describe)
			.sort(order);
		const next = {
			count: entries.length,
			bytes: entries.reduce((sum, entry) => sum + entry.bytes, 0),
			entries,
			scannedAt: Date.now()
		};
		cache.set(lane, next);
		return next;
	}

	function recordPut(lane, target, existing, existed, bytes, updatedAt) {
		const current = read(lane);
		const entries = current.entries.filter(entry => entry.file !== target);
		entries.push({ bytes, file: target, updatedAt });
		entries.sort(order);
		const next = {
			count: current.count + (existed ? 0 : 1),
			bytes: current.bytes - existing + bytes,
			entries,
			scannedAt: Date.now()
		};
		cache.set(lane, next);
		return next;
	}

	function recordRemove(lane, target, existing) {
		const current = cache.get(lane);
		if (!current) return;
		cache.set(lane, {
			...current,
			count: Math.max(0, current.count - 1),
			bytes: Math.max(0, current.bytes - existing),
			entries: current.entries.filter(entry => entry.file !== target),
			scannedAt: Date.now()
		});
	}

	return { read, recordPut, recordRemove, scan };
}

function describe(file) {
	try {
		const stat = fs.lstatSync(file);
		return {
			bytes: stat.isFile() && !stat.isSymbolicLink() ? stat.size : 0,
			file,
			updatedAt: stat.mtime.toISOString()
		};
	} catch {
		return { bytes: 0, file, updatedAt: null };
	}
}

function order(left, right) {
	return String(left.updatedAt || "").localeCompare(String(right.updatedAt || ""));
}

module.exports = { createUsage };
