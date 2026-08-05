// B"H

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Sources = require("./sources.js");
const System = require("./system.js");

/**
 * @file Writes one redacted incident bundle under private recovery storage.
 * @description
 * The Awtsmoos gathers runtime, recovery, process, and LaunchAgent testimony into
 * one timestamped vessel. JSON remains directly readable; a gzip archive makes the
 * same evidence portable without ever collecting Keychain secrets or raw credentials.
 */
function create(options = {}) {
	const home = options.home || os.homedir();
	const installRoot = options.installRoot || path.join(home, ".awtsmoos-tunnel");
	const recoveryRoot = options.recoveryRoot || path.join(home, ".awtsmoos-tunnel-recovery");
	const outputRoot = options.outputRoot || path.join(recoveryRoot, "diagnostics");
	const stamp = safeStamp(options.now || new Date());
	const directory = path.join(outputRoot, `incident-${stamp}`);
	fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
	fs.chmodSync(outputRoot, 0o700);
	fs.chmodSync(directory, 0o700);
	const report = {
		BH: "B\"H",
		version: 1,
		createdAt: new Date(options.now || Date.now()).toISOString(),
		roots: {
			installRoot,
			recoveryRoot
		},
		...System.collect(),
		files: Sources.collect(installRoot, recoveryRoot)
	};
	const reportFile = path.join(directory, "report.json");
	fs.writeFileSync(reportFile, `${JSON.stringify(report, null, 2)}\n`, { mode: 0o600 });
	fs.chmodSync(reportFile, 0o600);
	const archive = archiveDirectory(outputRoot, directory);
	return {
		ok: true,
		directory,
		reportFile,
		archive,
		createdAt: report.createdAt
	};
}

function archiveDirectory(outputRoot, directory) {
	const archive = `${directory}.tar.gz`;
	const result = spawnSync("tar", [
		"-czf",
		archive,
		"-C",
		outputRoot,
		path.basename(directory)
	], { encoding: "utf8", timeout: 15000 });
	if (result.status !== 0) return "";
	fs.chmodSync(archive, 0o600);
	return archive;
}

function safeStamp(value) {
	return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

module.exports = {
	create,
	safeStamp
};
