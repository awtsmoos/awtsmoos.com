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
	`awtsmoos-cdp-reconnect-install-${process.pid}`
);
process.env.AWTSMOOS_INSTALL_ROOT = installRoot;

const ChromeActions = require("../tools/chrome/actions.js");
const cdp = require("../tools/chrome/cdp.js");
const { findChrome } = require("../tools/chrome/finder.js");
const { handleChrome } = require("../tools/chrome/index.js");
const {
	staticServerStart,
	staticServerStop
} = require("../tools/fs/staticServers.js");

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
	if (!chromePath) {
		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-cdp-reconnect-integration",
			skipped: true,
			reason: "chrome_not_installed"
		}, null, 2));
		return;
	}

	const root = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-cdp-reconnect-page-")
	);
	const profile = await fs.mkdtemp(
		path.join(os.tmpdir(), "awtsmoos-cdp-reconnect-profile-")
	);
	const port = await freePort();
	const browserSessionId = `reconnect-${process.pid}`;
	const secondBrowserSessionId = `reconnect-second-${process.pid}`;
	let server;
	let launchPid;
	let secondTargetId;
	try {
		await fs.writeFile(
			path.join(root, "index.html"),
			"<!doctype html><title>Awtsmoos reconnect proof</title>"
				+ "<main id=\"proof\">THE BRIDGE RETURNED</main>"
		);
		server = await staticServerStart(
			{ root, allowWrite: true },
			{ path: ".", port: 0, index: "index.html" }
		);
		assert.equal(server.ok, true, JSON.stringify(server));

		const launched = await ChromeActions.chromeLaunch({
			port,
			chromePath,
			userDataDir: profile,
			headless: true,
			persist: false,
			timeoutMs: 20000
		});
		launchPid = launched.pid;
		assert.equal(launched.ok, true, JSON.stringify(launched));

		const page = await ChromeActions.chromeNewPage({
			port,
			url: server.url,
			browserSessionId
		});
		assert.equal(page.ok, true, JSON.stringify(page));
		const targetId = page.chromeTargetId;

		const navigated = await ChromeActions.chromeNavigate({
			port,
			url: server.url,
			chromeTargetId: targetId,
			browserSessionId,
			timeoutMs: 15000
		});
		assert.equal(navigated.ok, true, JSON.stringify(navigated));
		assert.equal(navigated.chromeTargetId, targetId);

		assert.equal(cdp.dropCurrentSocket(), true);
		await new Promise(resolve => setTimeout(resolve, 100));

		const evaluated = await cdp.cdpCall("Runtime.evaluate", {
			expression: "({href:location.href,text:document.querySelector('#proof')?.textContent})",
			awaitPromise: true,
			returnByValue: true
		}, 10000);
		assert.deepEqual(evaluated.result?.value, {
			href: server.url,
			text: "THE BRIDGE RETURNED"
		});

		const targets = await ChromeActions.chromeTargets({ port });
		assert.ok(
			targets.targets.some(target => target.id === targetId),
			"the exact leased page must survive the bridge reconnect"
		);
		assert.equal(
			cdp.targetLease(targetId)?.browserSessionId,
			browserSessionId
		);

		const secondPage = await ChromeActions.chromeNewPage({
			port,
			url: server.url,
			browserSessionId: secondBrowserSessionId
		});
		assert.equal(secondPage.ok, true, JSON.stringify(secondPage));
		secondTargetId = secondPage.chromeTargetId;

		for (const input of [
			{
				chromeTargetId: targetId,
				browserSessionId,
				value: "first-agent"
			},
			{
				chromeTargetId: secondTargetId,
				browserSessionId: secondBrowserSessionId,
				value: "second-agent"
			}
		]) {
			const stored = await handleChrome({
				action: "chromeStorageSet",
				port,
				storageType: "sessionStorage",
				name: "agent",
				...input
			});
			assert.equal(stored.ok, true, JSON.stringify(stored));
		}

		const [firstStorage, secondStorage] = await Promise.all([
			handleChrome({
				action: "chromeStorage",
				port,
				storageType: "sessionStorage",
				chromeTargetId: targetId,
				browserSessionId
			}),
			handleChrome({
				action: "chromeStorage",
				port,
				storageType: "sessionStorage",
				chromeTargetId: secondTargetId,
				browserSessionId: secondBrowserSessionId
			})
		]);
		assert.equal(firstStorage.values.agent, "first-agent");
		assert.equal(secondStorage.values.agent, "second-agent");

		const cookieName = `awtsmoos_browser_${process.pid}`;
		const cookieSet = await handleChrome({
			action: "chromeCookieSet",
			port,
			url: server.url,
			name: cookieName,
			value: "connected",
			chromeTargetId: targetId,
			browserSessionId
		});
		assert.equal(cookieSet.ok, true, JSON.stringify(cookieSet));
		const exported = await handleChrome({
			action: "chromeSessionExport",
			port,
			url: server.url,
			includeValues: true,
			chromeTargetId: targetId,
			browserSessionId
		});
		assert.equal(exported.sessionStorage.agent, "first-agent");
		assert.ok(exported.cookies.some(cookie => (
			cookie.name === cookieName && cookie.value === "connected"
		)));
		const cookieDeleted = await handleChrome({
			action: "chromeCookieDelete",
			port,
			url: server.url,
			name: cookieName,
			chromeTargetId: targetId,
			browserSessionId
		});
		assert.equal(cookieDeleted.ok, true, JSON.stringify(cookieDeleted));

		const denied = await handleChrome({
			action: "chromeStorage",
			port,
			storageType: "sessionStorage",
			chromeTargetId: targetId,
			browserSessionId: secondBrowserSessionId
		}).then(
			value => value,
			error => ({ ok: false, error: error.message })
		);
		assert.equal(denied.ok, false);
		assert.match(denied.error, /lease mismatch/);

		const secondClosed = await ChromeActions.chromeClosePage({
			port,
			chromeTargetId: secondTargetId,
			browserSessionId: secondBrowserSessionId
		});
		assert.equal(secondClosed.ok, true, JSON.stringify(secondClosed));
		secondTargetId = null;

		const closed = await ChromeActions.chromeClosePage({
			port,
			chromeTargetId: targetId,
			browserSessionId
		});
		assert.equal(closed.ok, true, JSON.stringify(closed));

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
			suite: "chrome-cdp-reconnect-integration",
			droppedBridgeRecovered: true,
			exactTargetPreserved: true,
			twoAgentSessionStorageIsolated: true,
			crossAgentTargetAccessDenied: true,
			cookieAndSessionExportVerified: true,
			targetClosed: true,
			browserStopped: true
		}, null, 2));
	} finally {
		if (secondTargetId) {
			await ChromeActions.chromeClosePage({
				port,
				chromeTargetId: secondTargetId,
				browserSessionId: secondBrowserSessionId,
				force: true
			}).catch(() => {});
		}
		if (launchPid) {
			await ChromeActions.chromeStop({
				port,
				pid: launchPid,
				force: true
			}).catch(() => {});
		}
		if (server?.serverId) {
			await staticServerStop({
				serverId: server.serverId
			}).catch(() => {});
		}
		await fs.rm(root, { recursive: true, force: true });
		await fs.rm(profile, { recursive: true, force: true });
		await fs.rm(installRoot, { recursive: true, force: true });
		await fs.rm(`${installRoot}-recovery`, {
			recursive: true,
			force: true
		});
	}
}

run().catch(error => {
	console.error(error?.stack || error);
	process.exitCode = 1;
});
