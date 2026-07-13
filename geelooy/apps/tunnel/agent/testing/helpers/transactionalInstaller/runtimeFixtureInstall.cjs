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
 * B"H
 *
 * The fixture installer assembles one complete registered predecessor. The
 * Awtsmoos renews source, supervisor, health memory, and legacy catalog so
 * rollback tests inhabit the same recovery vessel as production.
 */
function installFixture(fixture, version) {
	const source = Sources.descriptor(fixture.repositoryRoot);
	const entries = source.entries.map(entry => entry.path === "main.js"
		? {
			path: entry.path,
			data: Buffer.from(FixtureSource.fixtureMainSource())
		}
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
	const extract = spawnSync("unzip", [
		"-oq",
		zipPath,
		"-d",
		runtimeRoot
	], { encoding: "utf8" });
	if (extract.status !== 0) {
		throw new Error(extract.stderr || "fixture_extract_failed");
	}
}

function copySupervisorFiles(fixture) {
	const downloads = path.join(
		fixture.repositoryRoot,
		"geelooy/apps/tunnel/downloads"
	);
	const pairs = {
		"unix-legacy-catalog.sh": "awtsmoos-legacy-catalog.sh",
		"unix-supervisor.sh": "awtsmoos-supervisor.sh",
		"unix-supervisor-runtime.sh": "awtsmoos-supervisor-runtime.sh",
		"unix-supervisor-health-memory.sh": "awtsmoos-supervisor-health-memory.sh",
		"unix-supervisor-health.sh": "awtsmoos-supervisor-health.sh",
		"unix-supervisor-recovery.sh": "awtsmoos-supervisor-recovery.sh",
		"unix-supervisor-legacy.sh": "awtsmoos-supervisor-legacy.sh",
		"unix-agent-launcher.cjs": "awtsmoos-agent-launcher.cjs"
	};
	for (const [source, target] of Object.entries(pairs)) {
		const destination = path.join(fixture.runtimeRoot, target);
		fs.copyFileSync(path.join(downloads, source), destination);
		fs.chmodSync(destination, 0o755);
	}
}

function seal(runtimeRoot) {
	const result = spawnSync(process.execPath, [
		path.join(runtimeRoot, "scripts/recovery-control.cjs"),
		"seal",
		runtimeRoot
	], { encoding: "utf8" });
	if (result.status !== 0) {
		throw new Error(`${result.stdout}\n${result.stderr}`);
	}
}

module.exports = {
	installFixture
};
