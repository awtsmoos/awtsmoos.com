// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs/promises");
const net = require("node:net");
const os = require("node:os");
const path = require("node:path");

const installRoot = path.join(
	os.tmpdir(),
	`awtsmoos-chrome-webgl-install-${process.pid}`
);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const ChromeActions = require("../tools/chrome/actions.js");
const ChromeExtras = require("../tools/chrome/extras.js");
const { findChrome } = require("../tools/chrome/finder.js");
const { chromeLaunchArgs } = require("../tools/chrome/launchArgs.js");
const { staticServerStart, staticServerStop } = require(
	"../tools/fs/staticServers.js"
);

function freePort() {
	return new Promise((resolve, reject) => {
		const server = net.createServer();
		server.once("error", reject);
		server.listen(0, "127.0.0.1", () => {
			const { port } = server.address();
			server.close(error => error ? reject(error) : resolve(port));
		});
	});
}

async function run() {
	const chromePath = findChrome();
	const args = chromeLaunchArgs({
		headless: true,
		port: 9222,
		userDataDir: path.join(os.tmpdir(), "awtsmoos-webgl-args"),
		url: "about:blank"
	});
	assert.equal(args.includes("--disable-gpu"), false);
	assert.equal(args.includes("--enable-webgl"), true);
	assert.equal(args.includes("--use-gl=angle"), true);
	assert.equal(args.includes("--use-angle=swiftshader"), true);
	assert.equal(args.includes("--enable-unsafe-swiftshader"), true);

	if (!chromePath) {
		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-webgl-integration",
			skipped: true,
			reason: "chrome_not_installed",
			launchArgumentsVerified: true
		}, null, 2));
		return;
	}

	const root = await fs.mkdtemp(path.join(os.tmpdir(), "awtsmoos-webgl-page-"));
	const profile = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-webgl-profile-")
	);
	const port = await freePort();
	let server;
	let launchPid;
	try {
		await fs.writeFile(path.join(root, "index.html"), [
			"<!doctype html>",
			"<meta charset=\"utf-8\">",
			"<link rel=\"icon\" href=\"data:,\">",
			"<title>Awtsmoos WebGL proof</title>",
			"<main id=\"proof\">PROBING_WEBGL</main>",
			"<script>",
			"const proof = document.querySelector('#proof');",
			"const canvas = document.createElement('canvas');",
			"const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');",
			"proof.dataset.webgl = String(Boolean(gl));",
			"proof.textContent = gl ? 'WEBGL_READY' : 'WEBGL_MISSING';",
			"</script>"
		].join("\n"));
		server = await staticServerStart(
			{ root, allowWrite: true },
			{ path: ".", port: 0, index: "index.html" }
		);
		assert.equal(server.ok, true, JSON.stringify(server));

		const result = await ChromeExtras.chromeTestUrl({
			url: server.url,
			port,
			chromePath,
			userDataDir: profile,
			headless: true,
			autoLaunch: true,
			persistChrome: false,
			timeoutMs: 25000,
			selector: "#proof[data-webgl='true']",
			selectorTimeoutMs: 15000,
			assertNoConsoleErrors: true,
			snapshot: true,
			clearLogs: true
		});
		launchPid = result.launchPid;
		assert.equal(result.ok, true, JSON.stringify(result));
		assert.equal(result.selectorFound, true, JSON.stringify(result));
		assert.equal(result.errorCount, 0, JSON.stringify(result));
		assert.match(
			JSON.stringify(result.snapshot),
			/WEBGL_READY/,
			JSON.stringify(result)
		);

		const stopped = await ChromeActions.chromeStop({
			port,
			pid: launchPid,
			force: true
		});
		assert.equal(stopped.ok, true, JSON.stringify(stopped));
		assert.equal(stopped.stopped, true, JSON.stringify(stopped));
		launchPid = null;

		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-webgl-integration",
			headlessWebGl: true,
			softwareRendererConfigured: true,
			errorCount: 0,
			browserStopped: true
		}, null, 2));
	} finally {
		if (launchPid) {
			await ChromeActions.chromeStop({
				port,
				pid: launchPid,
				force: true
			}).catch(() => {});
		}
		if (server?.serverId) {
			await staticServerStop({ serverId: server.serverId }).catch(() => {});
		}
		await fs.rm(root, { recursive: true, force: true });
		await fs.rm(profile, { recursive: true, force: true });
		await fs.rm(installRoot, { recursive: true, force: true });
	}
}

run().catch(error => {
	console.error(error);
	process.exit(1);
});
