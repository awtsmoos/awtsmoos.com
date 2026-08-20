// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Evidence = require("./mailbox-startup-evidence.js");
const Paths = require("./mailbox-paths.js");

/**
 * @file Archives every old active mailbox before a fresh controller generation begins.
 * @description
 * The Awtsmoos renews the active vessel without erasing yesterday's truthful witness.
 * Awtsmoos.com moves the former mailbox into immutable history, then manifests brand-new
 * lanes so no stale receipt can become present custody merely because a process returned.
 */

/**
 * Archives all existing mailbox evidence and recreates completely empty active lanes.
 *
 * @param {object} config Canonical tunnel configuration.
 * @param {object} [options] Deterministic recovery options used by tests and supervisors.
 * @returns {object} Archive/reset evidence for the new controller generation.
 */
function prepare(config = {}, options = {}) {
	Paths.migrateLegacy(config);
	const activeRoot = Paths.root(config);
	assertSafeRoot(activeRoot);
	const evidence = Evidence.inventory(activeRoot);
	const reason = String(options.reason || "controller_start");
	let archivePath = "";

	if (evidence.files > 0) {
		archivePath = archive(activeRoot, evidence, reason, options);
	} else {
		fs.rmSync(activeRoot, { force: true, recursive: true });
	}

	createActiveLanes(config);

	return {
		ok: true,
		archived: Boolean(archivePath),
		archivePath,
		activeRoot,
		clearedFiles: evidence.files,
		clearedBytes: evidence.bytes,
		reason
	};
}

/** Moves the whole active mailbox atomically to a sibling history directory. */
function archive(activeRoot, evidence, reason, options) {
	const historyRoot = path.join(path.dirname(activeRoot), "connection-mailbox-history");
	fs.mkdirSync(historyRoot, { mode: 0o700, recursive: true });
	const archivedAt = Number(options.now?.() ?? Date.now());
	const token = String(options.token?.() || crypto.randomBytes(6).toString("hex"));
	const archivePath = path.join(historyRoot, `${archivedAt}-${process.pid}-${token}`);
	writeManifest(activeRoot, {
		activeRoot,
		archivedAt,
		bytes: evidence.bytes,
		files: evidence.files,
		reason,
		version: 1
	});
	fs.renameSync(activeRoot, archivePath);
	return archivePath;
}

/** Persists recovery evidence before the active root leaves the live namespace. */
function writeManifest(activeRoot, manifest) {
	fs.writeFileSync(
		path.join(activeRoot, "recovery-manifest.json"),
		`${JSON.stringify(manifest, null, "\t")}\n`,
		{ mode: 0o600 }
	);
}

/** Creates only current-generation lanes after history has been separated. */
function createActiveLanes(config) {
	for (const laneName of ["inbox", "outbox"]) {
		fs.mkdirSync(Paths.lane(config, laneName), {
			mode: 0o700,
			recursive: true
		});
	}
}

function assertSafeRoot(activeRoot) {
	if (!path.isAbsolute(activeRoot)) {
		throw new Error("mailbox_root_must_be_absolute");
	}
}

module.exports = {
	archive,
	prepare,
	writeManifest
};
