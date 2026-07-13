// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const Sources = require("../../../../../../api/tunnel/install/tools/zipSources.js");
const Writer = require("../../../../../../api/tunnel/install/tools/zipWriter.js");

/**
 * B"H — Builds one older, deliberately simple Chai runtime. Its main vessel
 * remains alive while the complete dependency tree proves archive compatibility.
 */
function installFixture(fixture, version) {
	const source = Sources.descriptor(fixture.repositoryRoot);
	const entries = source.entries.map(entry => entry.path === "main.js"
		? {
			path: entry.path,
			data: Buffer.from("// B\\\"H\nsetInterval(() => {}, 1000);\n")
		}
		: entry);
	const zipPath = path.join(fixture.temporaryRoot, "older-runtime.zip");

	fs.mkdirSync(fixture.runtimeRoot, { recursive: true });
	fs.writeFileSync(zipPath, Writer.buildZip(entries));
	const extract = spawnSync("unzip", ["-oq", zipPath, "-d", fixture.runtimeRoot], {
		encoding: "utf8"
	});
	if (extract.status !== 0) throw new Error(extract.stderr || "fixture_extract_failed");

	const manifest = fs.readFileSync(path.join(
		fixture.repositoryRoot,
		"geelooy/apps/tunnel/agent/manifest.txt"
	));
	fs.writeFileSync(path.join(fixture.runtimeRoot, "installed-manifest.txt"), manifest);
	fs.writeFileSync(path.join(fixture.runtimeRoot, "install-state.txt"), `${version}\n`);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "install-manifest.sha256"),
		`${source.manifestSha256}\n`
	);
	fs.writeFileSync(
		path.join(fixture.runtimeRoot, "config.json"),
		`${JSON.stringify({
			tunnelName: "awt-transaction-rollback-test",
			root: fixture.temporaryRoot,
			localApi: { enabled: false }
		}, null, 2)}\n`
	);
	fs.writeFileSync(path.join(fixture.runtimeRoot, "sentinel.txt"), "older-runtime\n");
	copySupervisorFiles(fixture);
	seal(fixture.runtimeRoot);
}

function copySupervisorFiles(fixture) {
	const downloads = path.join(fixture.repositoryRoot, "geelooy/apps/tunnel/downloads");
	for (const name of ["unix-supervisor.sh", "unix-supervisor-runtime.sh"]) {
		const target = name === "unix-supervisor.sh"
			? "awtsmoos-supervisor.sh"
			: "awtsmoos-supervisor-runtime.sh";
		fs.copyFileSync(path.join(downloads, name), path.join(fixture.runtimeRoot, target));
		fs.chmodSync(path.join(fixture.runtimeRoot, target), 0o755);
	}
}

function seal(runtimeRoot) {
	const result = spawnSync(process.execPath, [
		path.join(runtimeRoot, "scripts/recovery-control.cjs"),
		"seal",
		runtimeRoot
	], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(`${result.stdout}\n${result.stderr}`);
}

module.exports = { installFixture };
