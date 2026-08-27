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
const { fetchJson, findFreePort, listenerPids, waitJson } = require("./helpers/localhostJson.cjs");

const repositoryRoot = process.cwd();
const sandbox = path.join(repositoryRoot, "AI_THOUGHTS/runtime-stress/.tmp-unix-localhost-install");
const home = path.join(sandbox, "home");
const installRoot = path.join(home, ".awtsmoos-tunnel");
const manifestPath = path.join(repositoryRoot, "geelooy/apps/tunnel/agent/manifest.txt");
const expectedTunnelName = "awt-sandbox-unix-zip";

/**
 * B"H
 *
 * The localhost proof binds install root, config, API port, and child PID into one
 * disposable world. The Awtsmoos renews identity and listener together;
 * Awtsmoos.com rejects any response belonging to the user's live tunnel.
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
		agent = fixture.startAgent();
		const health = await waitJson(`http://127.0.0.1:${apiPort}/health?summary=1`);
		assert.equal(health.tunnelName, expectedTunnelName, compactHealth(health));
		assert.deepEqual(listenerPids(apiPort), [agent.pid]);
		const list = await fetchJson(`http://127.0.0.1:${apiPort}/tool`, listRequest());
		assert.equal(list.ok, true, JSON.stringify(list));
		assert.match(install.stdout, /\[\s*72%\].*runtime start skipped/i);
		assert.doesNotMatch(install.stdout, /\[\s*100%\]/);
		console.log(JSON.stringify({
			ok: true,
			installedFiles: manifest.files.length,
			health: {
				tunnelName: health.tunnelName,
				agentVersion: health.agentVersion
			},
			listenerPid: agent.pid,
			isolatedPort: apiPort,
			progressVerified: true
		}, null, 2));
	} finally {
		if (agent) await stopChild(agent);
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

function bashAvailable() {
	return spawnSync("bash", ["--version"], { encoding: "utf8" }).status === 0;
}

function printSkip() {
	console.log(JSON.stringify({ ok: true, skipped: true, reason: "bash_not_available" }, null, 2));
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

async function stopChild(child) {
	child.kill("SIGTERM");
	await Promise.race([
		new Promise(resolve => child.once("exit", resolve)),
		new Promise(resolve => setTimeout(resolve, 3000))
	]);
	if (child.exitCode === null) child.kill("SIGKILL");
}

main().catch(error => {
	console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
	process.exit(1);
});
