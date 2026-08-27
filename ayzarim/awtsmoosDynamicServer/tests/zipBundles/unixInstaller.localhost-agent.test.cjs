// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");
const { UnixInstallerFixture } = require("./helpers/unixInstallerFixture.cjs");
const { findFreePort } = require("./helpers/localhostJson.cjs");

const repositoryRoot = process.cwd();
const sandbox = path.join(repositoryRoot, "AI_THOUGHTS/runtime-stress/.tmp-unix-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const manifestPath = path.join(repositoryRoot, "geelooy/apps/tunnel/agent/manifest.txt");
const expectedTunnelName = "awt-sandbox-unix-zip";

/**
 * @file Proves Unix skip-start prepares a complete release without activating the runtime root.
 * @description
 * The Awtsmoos lets verified bytes arrive while the living vessel remains undisturbed;
 * Awtsmoos.com records the prepared candidate exactly, so a safe update never becomes a hidden restart served.
 */
async function main() {
	if (!bashAvailable()) return printSkip();
	fs.rmSync(sandbox, { recursive: true, force: true });
	await fsp.mkdir(home, { recursive: true });
	const manifest = parseManifest(fs.readFileSync(manifestPath, "utf8"));
	const fixture = new UnixInstallerFixture(repositoryRoot, {
		home,
		installRoot,
		apiPort: await findFreePort(),
		tunnelName: expectedTunnelName
	});
	await fixture.start(0);
	try {
		const install = await fixture.runInstaller();
		const journal = readJournal(fixture.recoveryRoot);
		assert.equal(journal.phase, "prepared_not_activated");
		assert.equal(journal.version, manifest.version);
		assert.equal(path.dirname(journal.candidate), path.dirname(installRoot));
		assert.match(path.basename(journal.candidate), /^\.awtsmoos-tunnel\.prepared-/);
		assert.equal(fs.existsSync(path.join(installRoot, "main.js")), false);
		assertPrepared(manifest, journal.candidate);
		assertPreparedConfig(journal.candidate);
		assert.match(install.stdout, /Runtime start skipped by explicit request\./);
		assert.match(install.stdout, /phase=prepared_not_activated/);
		assert.doesNotMatch(install.stdout, /\[\s*100%\]/);
		console.log(JSON.stringify({
			ok: true,
			suite: "unix-installer-prepared-release",
			version: manifest.version,
			preparedFiles: manifest.files.length,
			phase: journal.phase,
			activeRootPreserved: true
		}, null, 2));
	} finally {
		await fixture.close();
	}
}

function readJournal(recoveryRoot) {
	const file = path.join(recoveryRoot, "transactions", "install-current.json");
	return JSON.parse(fs.readFileSync(file, "utf8"));
}

function assertPrepared(manifest, candidate) {
	for (const file of [manifest.entry, ...manifest.files]) {
		assert.equal(fs.existsSync(path.join(candidate, file)), true, `missing ${file}`);
	}
}

function assertPreparedConfig(candidate) {
	const config = JSON.parse(fs.readFileSync(path.join(candidate, "config.json"), "utf8"));
	assert.equal(config.tunnelName, expectedTunnelName);
	assert.equal(path.resolve(config.root), path.resolve(repositoryRoot));
}

function bashAvailable() {
	return spawnSync("bash", ["--version"], { encoding: "utf8" }).status === 0;
}

function printSkip() {
	console.log(JSON.stringify({ ok: true, skipped: true, reason: "bash_not_available" }));
}

main().catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
	process.exit(1);
});
