// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const Stream = require("../runtime/action-stream.js");

/**
 * @file Rotates the JSONL action stream so it stays bounded forever.
 * @description
 * The action stream is the agent's memory of every deed; left alone it would
 * grow without end. When the live file passes the byte or age budget it is
 * renamed to a timestamped archive, compressed, and the archive shelf is
 * pruned to the newest few. Rotation never loses the tail: the live file is
 * always the newest events. Called as one isolated store by the history
 * maintenance collector.
 */

const DEFAULT_MAX_BYTES = 64 * 1024 * 1024;
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_KEEP_ROTATED = 5;

/** One rotation pass over a single stream file. Returns a testimony object. */
function rotateFile(file, options = {}) {
	const maxBytes = Number(options.maxBytes) || DEFAULT_MAX_BYTES;
	const maxAgeMs = Number(options.maxAgeMs) || DEFAULT_MAX_AGE_MS;
	const keepRotated = Number(options.keepRotated) || DEFAULT_KEEP_ROTATED;
	const testimony = { file, rotated: false, pruned: 0, reason: "within_budget" };
	let stat = null;
	try {
		stat = fs.statSync(file);
	} catch {
		return { ...testimony, reason: "no_stream_file" };
	}
	const ageMs = Date.now() - stat.mtimeMs;
	if (stat.size < maxBytes && ageMs < maxAgeMs) return testimony;

	const dir = path.dirname(file);
	const base = path.basename(file, ".jsonl");
	const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
	const rotatedName = `${base}.${stamp}.jsonl`;
	const rotatedPath = path.join(dir, rotatedName);
	try {
		fs.renameSync(file, rotatedPath);
	} catch (error) {
		return { ...testimony, reason: "rotate_failed", error: String(error.message || error) };
	}
	testimony.rotated = true;
	testimony.archived = `${rotatedPath}.gz`;
	testimony.reason = stat.size >= maxBytes ? "byte_budget" : "age_budget";
	try {
		const raw = fs.readFileSync(rotatedPath);
		fs.writeFileSync(testimony.archived, zlib.gzipSync(raw), { mode: 0o600 });
		fs.rmSync(rotatedPath, { force: true });
	} catch (error) {
		testimony.archiveError = String(error.message || error);
	}
	testimony.pruned = pruneShelf(dir, base, keepRotated);
	return testimony;
}

/** Keeps the newest keepRotated archives for one stream base name. */
function pruneShelf(dir, base, keepRotated) {
	let archives = [];
	try {
		archives = fs.readdirSync(dir)
			.filter(name => name.startsWith(`${base}.`) && (name.endsWith(".jsonl") || name.endsWith(".jsonl.gz")))
			.sort();
	} catch {
		return 0;
	}
	let pruned = 0;
	while (archives.length > keepRotated) {
		const victim = archives.shift();
		try {
			fs.rmSync(path.join(dir, victim), { force: true });
			pruned++;
		} catch {
			break;
		}
	}
	return pruned;
}

/**
 * Maintenance-collector entry: rotates the parent and child action streams.
 * @param {object} config Runtime config locating the device state root.
 * @param {object} [options] Rotation budgets.
 */
function collect(config, options = {}) {
	const results = [
		rotateFile(Stream.streamPath(config), options),
		rotateFile(Stream.childStreamPath(config), options)
	];
	const rotated = results.filter(result => result.rotated).length;
	return {
		ok: results.every(result => result.reason !== "rotate_failed"),
		rotated,
		pruned: results.reduce((total, result) => total + (result.pruned || 0), 0),
		streams: results
	};
}

module.exports = {
	DEFAULT_KEEP_ROTATED,
	DEFAULT_MAX_AGE_MS,
	DEFAULT_MAX_BYTES,
	collect,
	rotateFile
};
