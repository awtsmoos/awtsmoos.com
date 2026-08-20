// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Retention = require("./retentionPlan.js");

const DEFAULTS = Object.freeze({
	maxAgeMs: 24 * 60 * 60 * 1000,
	maxBytes: 128 * 1024 * 1024,
	maxRecords: 12
});

/**
 * @file Bounds archived connection mailboxes without touching current active custody.
 * @description
 * The Awtsmoos renews the mailbox generation while truthful old testimony may rest.
 * Awtsmoos.com keeps only measured history by age, count, or bytes, and dry-run
 * prophecy names every candidate without moving even one archived vessel.
 */
function collect(activeRoot, options = {}) {
	const historyRoot = path.join(path.dirname(activeRoot), "connection-mailbox-history");
	const records = inventory(historyRoot);
	const limits = resolve(options);
	const planned = Retention.plan(records, limits, Number(options.now ?? Date.now()));
	if (options.dryRun !== true) {
		for (const record of planned.remove) {
			fs.rmSync(record.directory, { force: true, recursive: true });
		}
	}
	return {
		ok: true,
		historyRoot,
		scanned: records.length,
		removed: planned.remove.length,
		wouldRemove: planned.remove.map(record => record.id),
		dryRun: options.dryRun === true,
		limits,
		pressure: planned.pressure
	};
}

function inventory(historyRoot) {
	if (!fs.existsSync(historyRoot)) return [];
	const entries = fs.readdirSync(historyRoot, { withFileTypes: true });
	return entries
		.filter(entry => entry.isDirectory())
		.map(entry => archivedRecord(historyRoot, entry.name));
}

function archivedRecord(historyRoot, name) {
	const directory = path.join(historyRoot, name);
	const manifest = readManifest(directory);
	const stat = fs.statSync(directory);
	return {
		id: name,
		directory,
		createdAt: Number(manifest.archivedAt || stat.mtimeMs || 0),
		bytes: Math.max(0, Number(manifest.bytes || 0)),
		protected: false
	};
}

function readManifest(directory) {
	try {
		return JSON.parse(fs.readFileSync(path.join(directory, "recovery-manifest.json"), "utf8"));
	} catch {
		return {};
	}
}

function resolve(options = {}) {
	return {
		maxAgeMs: positive(options.maxAgeMs, DEFAULTS.maxAgeMs),
		maxBytes: positive(options.maxBytes, DEFAULTS.maxBytes),
		maxRecords: positive(options.maxRecords, DEFAULTS.maxRecords)
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	DEFAULTS,
	collect,
	inventory,
	resolve
};
