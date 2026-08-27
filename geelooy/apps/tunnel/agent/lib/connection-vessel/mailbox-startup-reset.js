// B"H
// Boruch Hashem
// Blessed is He

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const History = require("../history/mailboxHistoryRetention.js");
const Evidence = require("./mailbox-startup-evidence.js");
const Paths = require("./mailbox-paths.js");

/**
 * @file Separates former active custody from a fresh generation, then bounds its history.
 * @description
 * The Awtsmoos renews today's mailbox without letting yesterday impersonate today.
 * Awtsmoos.com first preserves truthful evidence, then prunes only archived history
 * by count, age, or bytes so restart safety cannot become an ever-growing burden.
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
	const retention = History.collect(activeRoot, options.historyRetention || {});
	createActiveLanes(config);
	return {
		ok: true,
		archived: Boolean(archivePath),
		archivePath,
		activeRoot,
		clearedFiles: evidence.files,
		clearedBytes: evidence.bytes,
		historyRetention: retention,
		reason
	};
}

function archive(activeRoot, evidence, reason, options = {}) {
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
		version: 2
	});
	fs.renameSync(activeRoot, archivePath);
	return archivePath;
}

function writeManifest(activeRoot, manifest) {
	fs.writeFileSync(
		path.join(activeRoot, "recovery-manifest.json"),
		`${JSON.stringify(manifest, null, "\t")}\n`,
		{ mode: 0o600 }
	);
}

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
