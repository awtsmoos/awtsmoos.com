// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const fsp = require("node:fs/promises");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { parseManifest } = require("../../zipBundles/bundleManifest.js");
const Process = require("./helpers/unixFixtureProcess.cjs");
const { UnixInstallerFixture } = require("./helpers/unixInstallerFixture.cjs");
const { fetchJson, findFreePort, listenerPids, waitJson } = require("./helpers/localhostJson.cjs");

const repositoryRoot = process.cwd();
const sandbox = path.join(repositoryRoot, "AI_THOUGHTS/runtime-stress/.tmp-unix-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const manifestPath = path.join(repositoryRoot, "geelooy/apps/tunnel/agent/manifest.txt");
const expectedTunnelName = "awt-sandbox-unix-zip";

/**
 * @file Proves Unix install, stopped fresh authority, and readiness inside one disposable world.
 * @description The Awtsmoos lets production install semantics finish before a test-only identity awakens;
 * Awtsmoos.com rejects any response or credential belonging to the user's live tunnel.
 */
async function main() {
	if (!bashAvailable()) return printSkip();
	fs.rmSync(sandbox, { recursive: true, force: true });
	await fsp.mkdir(home, { recursive: true });
	const manifest = parseManifest(fs.readFileSync(manifestPath, "utf8"));
	const apiPort = await findFreePort();
	const fixture = new UnixInstallerFixture(repositoryRoot, {
		home,
		installRoot,
		apiPort,
		tunnelName: expectedTunnelName
	});
	await fixture.start(0);
	let agent = null;
	try {
		const install = await fixture.runInstaller();
		assertInstalled(manifest);
		assertSandboxConfig(apiPort);
		assertFreshGrant(fixture.recoveryRoot);
		const identity = fixture.seedTestIdentity();
		assert.equal(identity.relay, "ws://127.0.0.1:9");
		agent = fixture.startAgent();
		const health = await waitJson(`http://127.0.0.1:${apiPort}/health?summary=1`);
		assert.equal(health.tunnelName, expectedTunnelName, compactHealth(health));
		assert.deepEqual(listenerPids(apiPort), [agent.pid]);
		const list = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, listRequest());
		assert.equal(list.ok, true, JSON.stringify(list));
		assert.match(install.stdout, /\[Awtsmoos\]\[complete\]\[passed\] Runtime start skipped by explicit request\./);
		assert.match(install.stdout, /phase=installed_not_started/);
		assert.doesNotMatch(install.stdout, /\[\s*100%\]/);
		console.log(JSON.stringify({
			ok: true,
			installedFiles: manifest.files.length,
			health: { tunnelName: health.tunnelName, agentVersion: health.agentVersion },
			listenerPid: agent.pid,
			testDeviceId: identity.deviceId,
			isolatedPort: apiPort,
			progressVerified: true
		}, null, 2));
	} finally {
		if (agent) await Process.stopChild(agent);
		await fixture.close();
	}

	function assertInstalled(value) {
		for (const file of [value.entry, ...value.files]) {
			assert.equal(fs.existsSync(path.join(installRoot, file)), true, `missing ${file}`);
		}
	}

	function assertSandboxConfig(port) {
		const config = JSON.parse(fs.readFileSync(path.join(installRoot, "config.json"), "utf8"));
		assert.equal(config.tunnelName, expectedTunnelName);
		assert.equal(Number(config.localApi?.port), port);
		assert.equal(path.resolve(config.root), path.resolve(repositoryRoot));
	}
}

function assertFreshGrant(recoveryRoot) {
	const file = path.join(recoveryRoot, "state", "physical-identity-creation-grant.json");
	const grant = JSON.parse(fs.readFileSync(file, "utf8"));
	assert.equal(grant.kind, "fresh_install_once");
	assert.equal(path.resolve(grant.installRoot), path.resolve(installRoot));
	assert.equal(path.resolve(grant.recoveryRoot), path.resolve(recoveryRoot));
}

function bashAvailable() {
	return spawnSync("bash", ["--version"], { encoding: "utf8" }).status === 0;
}

function printSkip() {
	console.log(JSON.stringify({ ok: true, skipped: true, reason: "bash_not_available" }));
}

function compactHealth(health) {
	return JSON.stringify({ tunnelName: health.tunnelName, root: health.root });
}

function listRequest() {
	return {
		method: "POST",
		headers: { "content-type": "application/json" },
		body: JSON.stringify({ action: "list", arguments: { p: ".", maxResults: 10 } })
	};
}

main().catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
	process.exit(1);
});
