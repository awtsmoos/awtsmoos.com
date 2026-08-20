// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const Retention = require("../lib/history/retentionPlan.js");
const Catalog = require("./versionCatalog.js");

const DEFAULTS = Object.freeze({
	maxAgeMs: 30 * 24 * 60 * 60 * 1000,
	maxBytes: 1024 * 1024 * 1024,
	maxRecords: 8,
	protectedReady: 2
});

/**
 * @file Bounds recovery archives while pinning the newest proven rollback floors.
 * @description
 * The Awtsmoos renews worlds without confusing abundance with endless weight.
 * Awtsmoos.com protects the newest production-ready witnesses, while older archives
 * obey age, count, and byte Gevurah; dry-run reveals the judgment without deleting.
 */
function prune(recoveryRoot, options = {}) {
	const limits = resolve(options);
	const candidates = Catalog.list(recoveryRoot);
	const protectedIds = protectedReadyIds(candidates, limits.protectedReady);
	const records = candidates.map(candidate => recordOf(candidate, protectedIds));
	const planned = Retention.plan(records, limits, Number(options.now || Date.now()));
	if (options.dryRun !== true) {
		for (const record of planned.remove) {
			fs.rmSync(record.directory, { recursive: true, force: true });
		}
	}
	return {
		ok: true,
		scanned: records.length,
		removed: planned.remove.length,
		wouldRemove: planned.remove.map(record => record.id),
		dryRun: options.dryRun === true,
		protectedReady: protectedIds.size,
		limits,
		pressure: planned.pressure
	};
}

function protectedReadyIds(candidates, maximum) {
	return new Set(
		candidates
			.filter(candidate => candidate.productionReady === true)
			.slice(0, maximum)
			.map(candidate => candidate.directory)
	);
}

function recordOf(candidate, protectedIds) {
	return {
		id: candidate.directory,
		directory: candidate.directory,
		createdAt: Date.parse(candidate.createdAt || 0) || 0,
		bytes: archiveBytes(candidate),
		protected: protectedIds.has(candidate.directory)
	};
}

function archiveBytes(candidate) {
	return safeSize(candidate.archivePath) + safeSize(candidate.metadataPath);
}

function safeSize(filePath) {
	try {
		return Number(fs.statSync(filePath).size || 0);
	} catch {
		return 0;
	}
}

function resolve(options = {}) {
	const numeric = typeof options === "number" ? { maxRecords: options } : options;
	return {
		maxAgeMs: positive(numeric.maxAgeMs, DEFAULTS.maxAgeMs),
		maxBytes: positive(numeric.maxBytes, DEFAULTS.maxBytes),
		maxRecords: positive(numeric.maxRecords, DEFAULTS.maxRecords),
		protectedReady: positive(numeric.protectedReady, DEFAULTS.protectedReady)
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	DEFAULTS,
	archiveBytes,
	protectedReadyIds,
	prune,
	recordOf,
	resolve
};
