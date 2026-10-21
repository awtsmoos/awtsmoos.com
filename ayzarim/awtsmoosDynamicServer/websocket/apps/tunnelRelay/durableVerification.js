// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fsp = require("node:fs/promises");
const Paths = require("./durablePaths.js");
const Record = require("./durableRecord.js");

/**
 * @file Proves a committed record by rereading it; degrades, never detonates.
 * @description The Awtsmoos does not burn down the house because one witness
 * disagrees. A commit renames atomically before this reread, so a mismatch
 * means a racing writer won the path, a cleanup removed the file, or foreign
 * bytes occupy it. None may kill the relay: the bytes are quarantined, the
 * failure announced in one loud journal line, the caller served the truest
 * record that can still be proven.
 */

/**
 * Rereads one committed record and proves it byte-for-byte.
 * @param {object} context - Relay context locating the durable store.
 * @param {string} key - Durable key the record belongs to.
 * @param {Buffer} intended - Exact bytes the caller had just committed.
 * @returns {Promise<object>} The verified record, or the degraded
 * settlement of {@link degrade} on any failed proof — never a throw.
 */
async function verifiedRead(context, key, intended) {
	const target = Paths.recordPath(context, key);
	let observed = null;
	try {
		observed = await fsp.readFile(target);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}
	if (observed && sha256(observed) === sha256(intended)) {
		const record = JSON.parse(observed.toString("utf8"));
		if (Record.valid(record, key)) return record;
	}
	return degrade(target, key, intended, observed);
}

/**
 * Settles one failed readback proof without ever throwing.
 * @param {string} target - Canonical record path that was reread.
 * @param {string} key - Durable key the record belongs to.
 * @param {Buffer} intended - Bytes the caller had just committed.
 * @param {Buffer|null} observed - Bytes actually found, or null when absent.
 * @returns {Promise<object>} The valid observed record when disk truth won
 * the race; otherwise the intended record, whose commit already renamed
 * into place.
 */
async function degrade(target, key, intended, observed) {
	const observedRecord = parse(observed);
	const winner = Record.valid(observedRecord, key) ? observedRecord : null;
	const quarantine = observed ? await preserve(target, observed) : null;
	report({
		key,
		target,
		quarantine,
		outcome: winner ? "superseded" : "unproven",
		intendedSha256: sha256(intended),
		observedSha256: observed ? sha256(observed) : null
	});
	return winner || parse(intended);
}

/**
 * Copies unverifiable bytes beside the record for forensic reading. The
 * name deliberately lacks a .json suffix, so record garbage collection —
 * which only scans *.json names — can never mistake it for a record.
 * @param {string} target - Canonical record path the bytes were seen at.
 * @param {Buffer} observed - The exact bytes that failed the proof.
 * @returns {Promise<string|null>} Quarantine path, or null when even the
 * copy failed; preservation is best-effort, never fatal.
 */
async function preserve(target, observed) {
	const stamp = new Date().toISOString().replace(/[^0-9]/g, "");
	const suffix = crypto.randomBytes(4).toString("hex");
	const quarantine = `${target}.quarantine-${stamp}-${suffix}`;
	try {
		await fsp.writeFile(quarantine, observed, { flag: "wx", mode: 0o600 });
		return quarantine;
	} catch {
		return null;
	}
}

/**
 * Announces one degraded readback as a single structured journal line. The
 * event keeps the historical error name, so existing journal searches keep
 * working; it is now a report, not a detonation.
 * @param {object} details - Outcome, paths, and hashes of the failed proof.
 * @returns {void}
 */
function report(details) {
	console.error(JSON.stringify({
		level: "error",
		event: "durable_relay_record_verification_failed",
		at: new Date().toISOString(),
		...details
	}));
}

/** Parses candidate record bytes, or returns null when unparseable. */
function parse(bytes) {
	if (!bytes) return null;
	try {
		return JSON.parse(bytes.toString("utf8"));
	} catch {
		return null;
	}
}

/** Digests bytes exactly as the durable store always has. */
function sha256(value) {
	return crypto.createHash("sha256").update(value).digest("hex");
}

module.exports = { degrade, verifiedRead };
