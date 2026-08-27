//B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const { ROOT, assert, test } = require("./assert.cjs");

/**
 * BFCache restore and service-worker disconnects must rejoin the same Awtsmoos.com
 * bridge without duplicate listeners. The Awtsmoos keeps reconnect ownership in
 * the content bridge and stale-port cleanup inside the port manager where it lives.
 */
function run() {
	return test("extension-bfcache-port-recovery-source", async () => {
		const extension = path.join(ROOT, "../scripts/tricks/extensions/server");
		const content = fs.readFileSync(path.join(extension, "awtsmoosContent.js"), "utf8");
		const manager = fs.readFileSync(path.join(extension, "portManager.js"), "utf8");
		const background = fs.readFileSync(path.join(extension, "background.js"), "utf8");
		assert(
			/bridgeKey\s*=\s*"__awtsmoosServerPortManager"/.test(content)
				&& /globalThis\[bridgeKey\]/.test(content),
			"content bridge must retain one per-page singleton"
		);
		assert(/pageshow/.test(content) && /persisted/.test(content), "BFCache restore must reconnect the bridge");
		assert(/port\.onDisconnect\.addListener/.test(content), "content bridge must reconnect after worker disconnect");
		assert(/delete this\.ports\[name\]/.test(manager), "port manager must remove disconnected ports");
		assert(/port\.onDisconnect\.addListener/.test(manager), "port manager must own disconnect cleanup");
		assert(/const portManager = globalThis\.__awtsmoosPortManager \|\| new ChromePortManager/.test(background), "worker generations must reuse one manager instance");
		assert(!/webNavigation|tabs\.onUpdated|scripting\.executeScript/.test(background), "background must not reinject the manifest content script");
		return {
			singleton: true,
			bfcacheReconnect: true,
			disconnectCleanup: true,
			manualInjection: false
		};
	});
}

module.exports = { run };
