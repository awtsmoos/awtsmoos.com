// B"H

const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(os.tmpdir(), `awtsmoos-chrome-install-${process.pid}`);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const cdp = require("../tools/chrome/cdp.js");
const ChromeActions = require("../tools/chrome/actions.js");
const ChromeExtras = require("../tools/chrome/extras.js");
const { findChrome } = require("../tools/chrome/finder.js");
const { discoverListeners } = require("../tools/fs/actionGroups/portActions.js");
const {
	staticServerStart,
	staticServerStop
} = require("../tools/fs/staticServers.js");

async function freePort() {
	const server = net.createServer();
	await new Promise((resolve, reject) => {
		server.once("error", reject);
		server.listen(0, "127.0.0.1", resolve);
	});
	const port = server.address().port;
	await new Promise(resolve => server.close(resolve));
	return port;
}

async function portClosed(port, timeoutMs = 5000) {
	const startedAt = Date.now();
	while (Date.now() - startedAt < timeoutMs) {
		const listeners = await discoverListeners([port]);
		if (!listeners.length) return true;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	return false;
}

function profileProcessIds(profile) {
	if (process.platform === "win32") return [];
	let output = "";
	try {
		output = childProcess.execFileSync("ps", ["-axo", "pid=,command="], {
			encoding: "utf8",
			maxBuffer: 4 * 1024 * 1024
		});
	} catch {}
	return output.split(/\r?\n/).map(line => {
		const match = line.match(/^\s*(\d+)\s+(.+)$/);
		return match && match[2].includes(profile) ? Number(match[1]) : null;
	}).filter(Number.isInteger);
}

async function stopBrowser(port, launchPid, profile) {
	cdp.closeCurrent("integration_test_cleanup");
	const discovered = await discoverListeners([port]);
	const pids = [...new Set([
		launchPid,
		...discovered.map(listener => listener.pid),
		...profileProcessIds(profile)
	].map(Number).filter(Number.isInteger))];
	for (const pid of pids) {
		try { process.kill(pid, "SIGTERM"); } catch {}
	}
	if (await portClosed(port, 2500)) return;
	for (const pid of pids) {
		try { process.kill(pid, "SIGKILL"); } catch {}
	}
	assert.equal(await portClosed(port, 2500), true, `Chrome port ${port} remained open`);
}

async function run() {
	const chromePath = findChrome();
	if (!chromePath) {
		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-auto-launch-integration",
			skipped: true,
			reason: "chrome_not_installed"
		}, null, 2));
		return;
	}
	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-chrome-page-"));
	const profile = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-chrome-profile-"));
	const port = await freePort();
	let server = null;
	let result = null;
	let browserStopped = false;
	try {
		await fs.writeFile(
			path.join(root, "index.html"),
			"<!doctype html><title>Awtsmoos browser proof</title>"
				+ "<link rel=\"icon\" href=\"data:,\">"
				+ "<main id=\"proof\">B'H browser auto-launch works</main>"
		);
		server = await staticServerStart(
			{ root, allowWrite: true },
			{ path: ".", port: 0, index: "index.html" }
		);
		assert.equal(server.ok, true, JSON.stringify(server));
		result = await ChromeExtras.chromeTestUrl({
			url: server.url,
			port,
			chromePath,
			userDataDir: profile,
			headless: true,
			autoLaunch: true,
			persistChrome: false,
			startupWaitMs: 1800,
			timeoutMs: 20000,
			selector: "#proof",
			selectorTimeoutMs: 10000,
			assertNoConsoleErrors: true,
			snapshot: true,
			clearLogs: true
		});
		assert.equal(result.ok, true, JSON.stringify(result));
		assert.equal(result.autoLaunched, true);
		assert.ok(result.launchPid);
		assert.equal(result.selectorFound, true);
		assert.equal(result.errorCount, 0);
		assert.equal(result.navigation.href, server.url);
		const wrapperUrl = `${server.url}?wrapper=1`;
		const navigated = await ChromeActions.chromeNavigate({
			port,
			href: wrapperUrl,
			timeoutMs: 15000
		});
		assert.equal(navigated.ok, true, JSON.stringify(navigated));
		assert.equal(navigated.navigation.href, wrapperUrl);
		const evaluated = await ChromeActions.chromeEval({
			port,
			command: "({title:document.title,proof:!!document.querySelector('#proof')})",
			timeoutMs: 10000
		});
		assert.equal(evaluated.ok, true, JSON.stringify(evaluated));
		assert.deepEqual(
			evaluated.result.result.valueSummary.value,
			{ title: "Awtsmoos browser proof", proof: true }
		);

		const config = JSON.parse(await fs.readFile(path.join(installRoot, "config.json"), "utf8"));
		assert.notEqual(config.chrome.port, port, "ephemeral Chrome port must not persist");
		assert.notEqual(config.chrome.userDataDir, profile, "ephemeral Chrome profile must not persist");
		const stopped = await ChromeActions.chromeStop({
			port,
			pid: result.launchPid,
			force: true
		});
		assert.equal(stopped.ok, true, JSON.stringify(stopped));
		assert.equal(stopped.owned, true);
		assert.equal(stopped.stopped, true);
		browserStopped = true;

		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-auto-launch-integration",
			autoLaunched: true,
			navigated: result.navigation.href,
			selectorFound: true,
			errorCount: 0,
			configUnchangedByEphemeralLaunch: true,
			navigateHrefAliasWorked: true,
			evalCommandAliasWorked: true,
			ownedBrowserStopped: true
		}, null, 2));
	} finally {
		if (!browserStopped) {
			await stopBrowser(port, result?.launchPid, profile).catch(error => {
				if (!process.exitCode) throw error;
			});
		}
		if (server?.serverId) await staticServerStop({ serverId: server.serverId });
		await fs.rm(root, { recursive: true, force: true });
		await fs.rm(profile, {
			recursive: true,
			force: true,
			maxRetries: 10,
			retryDelay: 100
		});
		await fs.rm(installRoot, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
