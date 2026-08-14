// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Sources = require("../../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../../api/tunnel/install/tools/zipWriter.js");
const FixtureSource = require("./runtimeFixtureSource.cjs");

/**
 * @file Installs a complete synthetic predecessor for transactional rollback tests.
 * @description
 * The Awtsmoos gives production and fixture one supervisor garment scroll. Identity,
 * emergency, receipt, singleton, health, and recovery helpers therefore cannot enter
 * the real guardian while silently disappearing from rollback and stability proofs.
 */
function installFixture(fixture, version) {
	const source = Sources.descriptor(fixture.repositoryRoot);
	const entries = source.entries.map(entry => entry.path === "main.js"
		? { path: entry.path, data: Buffer.from(FixtureSource.fixtureMainSource()) }
		: entry);
	const zipPath = path.join(fixture.temporaryRoot, "older-runtime.zip");
	fs.mkdirSync(fixture.runtimeRoot, { recursive: true });
	fs.writeFileSync(zipPath, Writer.buildZip(entries));
	extractRuntime(zipPath, fixture.runtimeRoot);
	FixtureSource.writeRuntimeMetadata(fixture, source, version);
	copySupervisorFiles(fixture);
	seal(fixture.runtimeRoot);
}

function extractRuntime(zipPath, runtimeRoot) {
	const result = spawnSync("unzip", ["-oq", zipPath, "-d", runtimeRoot], {
		encoding: "utf8"
	});
	if (result.status !== 0) throw new Error(result.stderr || "fixture_extract_failed");
}

function copySupervisorFiles(fixture) {
	const downloads = path.join(
		fixture.repositoryRoot,
		"geelooy/apps/tunnel/downloads"
	);
	for (const [source, target] of supervisorPairs(downloads)) {
		const destination = path.join(fixture.runtimeRoot, target);
		fs.copyFileSync(path.join(downloads, source), destination);
		fs.chmodSync(destination, 0o755);
	}
}

function supervisorPairs(downloads) {
	const manifest = path.join(downloads, "unix-supervisor-files.sh");
	const result = spawnSync("bash", ["-c", `set -Eeuo pipefail
source "$MANIFEST"
supervisor_runtime_pairs`], {
		encoding: "utf8",
		env: { ...process.env, MANIFEST: manifest }
	});
	if (result.status !== 0) {
		throw new Error(result.stderr || "fixture_supervisor_manifest_failed");
	}
	return result.stdout.trim().split(/\r?\n/).filter(Boolean).map(line => {
		const separator = line.indexOf(":");
		if (separator <= 0) throw new Error(`fixture_supervisor_pair_invalid:${line}`);
		return [line.slice(0, separator), line.slice(separator + 1)];
	});
}

function seal(runtimeRoot) {
	const result = spawnSync(process.execPath, [
		path.join(runtimeRoot, "scripts/recovery-control.cjs"),
		"seal",
		runtimeRoot
	], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
}

module.exports = {
	installFixture,
	supervisorPairs
};
