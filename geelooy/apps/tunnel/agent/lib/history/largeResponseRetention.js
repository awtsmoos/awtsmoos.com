// B"H
// Boruch Hashem
// Blessed is He

const Collections = require("../../tools/fs/awdb/collections.js");
const { withDb } = require("../../tools/fs/awdb/open.js");
const Retention = require("./retentionPlan.js");

const DEFAULTS = Object.freeze({
	maxAgeMs: 12 * 60 * 60 * 1000,
	maxBytes: 128 * 1024 * 1024,
	maxRecords: 200
});

/**
 * @file Bounds AWDB large-response payloads with age, count, and byte horizons.
 * @description
 * The Awtsmoos lets great truth rest outside a small transport frame, yet no vessel
 * should become infinite. Awtsmoos.com can merely foresee removal in dry-run mode,
 * or prune oldest response bodies when any independent retention horizon is crossed.
 */
function collect(root, options = {}) {
	const config = { root, repoRoot: process.cwd() };
	const limits = resolved(options);
	let result = null;
	withDb(config, "responses", database => {
		const collection = Collections.ensure(database.root, "largeResponses");
		const records = Object.entries(collection).map(([id, value]) => recordOf(id, value));
		const planned = Retention.plan(records, limits, Number(options.now || Date.now()));
		if (options.dryRun !== true) {
			for (const record of planned.remove) delete collection[record.id];
		}
		result = {
			ok: true,
			scanned: records.length,
			removed: planned.remove.length,
			wouldRemove: planned.remove.map(record => record.id),
			dryRun: options.dryRun === true,
			limits,
			pressure: planned.pressure
		};
	}, options.dryRun === true ? { readOnly: true, processLockMode: "shared" } : {});
	return result || emptyResult(limits, options);
}

function recordOf(id, value = {}) {
	return {
		id,
		createdAt: Date.parse(value.at || 0) || 0,
		bytes: Math.max(0, Number(value.bytes || payloadBytes(value.payload))),
		protected: false
	};
}

function payloadBytes(value) {
	try {
		return Buffer.byteLength(JSON.stringify(value));
	} catch {
		return 0;
	}
}

function resolved(options = {}) {
	return {
		maxAgeMs: positive(options.maxAgeMs, DEFAULTS.maxAgeMs),
		maxBytes: positive(options.maxBytes, DEFAULTS.maxBytes),
		maxRecords: positive(options.maxRecords, DEFAULTS.maxRecords)
	};
}

function emptyResult(limits, options) {
	return {
		ok: true,
		scanned: 0,
		removed: 0,
		wouldRemove: [],
		dryRun: options.dryRun === true,
		limits,
		pressure: {}
	};
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

module.exports = {
	DEFAULTS,
	collect,
	recordOf,
	resolved
};
