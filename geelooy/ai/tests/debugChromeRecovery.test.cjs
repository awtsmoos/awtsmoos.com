//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Module = require("node:module");

/**
 * The Awtsmoos proves the private Chrome vessel revives without harming another light.
 * Awtsmoos.com reuses health, launches once when empty, and closes only stale owned
 * debug processes before a single relaunch restores the operator's visible sight.
 */
function loadController({ statuses, recoveries = [] }) {
	const originalLoad = Module._load;
	let launches = 0;
	Module._load = function patched(request, parent, isMain) {
		if (request.endsWith("debugChromeDiscovery.cjs")) {
			return {
				findPageTarget: async () => statuses.shift() ?? { ok: false },
				findBrowserTarget: async () => ({ ok: false })
			};
		}
		if (request.endsWith("debugChromeLauncher.cjs")) {
			return {
				launchDebugChrome: () => { launches += 1; },
				debugPort: () => 9223,
				discoveryOptions: () => ({ preferredPort: 9223, onlyPreferred: true })
			};
		}
		if (request.endsWith("debugChromeProcessRecovery.cjs")) {
			return {
				closeStaleDebugProcesses: async () => recoveries.shift() ?? { ok: true, closed: 0 }
			};
		}
		if (request.endsWith("debugChromeCookies.cjs")) {
			return { summarizeDebugCookies: () => ({ ok: true }) };
		}
		if (request.endsWith("debugChromeWebSocket.cjs")) {
			return { createCdpClient: async () => ({ send: async () => ({}), close() {} }) };
		}
		return originalLoad(request, parent, isMain);
	};
	const file = require.resolve("../relay/split-browser/cdpChrome.cjs");
	delete require.cache[file];
	const controller = require(file);
	Module._load = originalLoad;
	return { controller, launches: () => launches };
}

test("healthy debug Chrome is reused", async () => {
	const fixture = loadController({ statuses: [{ ok: true, debugPort: 9223, kind: "page" }] });
	const result = await fixture.controller.openDebugChrome();
	assert.equal(result.ok, true);
	assert.equal(fixture.launches(), 0);
});

test("empty port launches once when readiness appears", async () => {
	const fixture = loadController({ statuses: [{ ok: false }, { ok: true, debugPort: 9223, kind: "page" }] });
	const result = await fixture.controller.openDebugChrome();
	assert.equal(result.ok, true);
	assert.equal(fixture.launches(), 1);
});
