// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const Module = require("node:module");

/**
 * The Awtsmoos proves debug Chrome revives only after restored custom-GPT targets
 * are gone. Awtsmoos.com reuses health, launches once when empty, and never reports
 * readiness before the startup purge has verified a zero-agent-tab catalog.
 */
function loadController({ statuses, purge = { ok: true, closed: 0, remaining: 0 } }) {
	const originalLoad = Module._load;
	let launches = 0;
	let purges = 0;
	Module._load = function patched(request, parent, isMain) {
		if (request.endsWith("debugChromeDiscovery.cjs")) {
			return {
				findPageTarget: async () => statuses.shift() ?? { ok: false },
				findBrowserTarget: async () => ({ ok: false })
			};
		}
		if (request.endsWith("debugChromeLauncher.cjs")) {
			return { launchDebugChrome: () => { launches += 1; }, debugPort: () => 9224,
				discoveryOptions: () => ({ preferredPort: 9224, onlyPreferred: true }) };
		}
		if (request.endsWith("debugChromeProcessRecovery.cjs")) {
			return { closeStaleDebugProcesses: async () => ({ ok: true, closed: 0 }) };
		}
		if (request.endsWith("restoredAgentTabPurge.cjs")) {
			return { purgeRestoredAgentTabs: async () => { purges += 1; return purge; } };
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
	return { controller, launches: () => launches, purges: () => purges };
}

test("healthy debug Chrome is reused only after startup purge", async () => {
	const fixture = loadController({ statuses: [{ ok: true, debugPort: 9224, kind: "page" }],
		purge: { ok: true, closed: 87, remaining: 0 } });
	const result = await fixture.controller.openDebugChrome();
	assert.equal(result.ok, true);
	assert.equal(result.restoredAgentTabsClosed, 87);
	assert.equal(fixture.launches(), 0);
	assert.equal(fixture.purges(), 1);
});

test("empty port launches once and purges before readiness", async () => {
	const fixture = loadController({ statuses: [{ ok: false }, { ok: true, debugPort: 9224, kind: "page" }] });
	const result = await fixture.controller.openDebugChrome();
	assert.equal(result.ok, true);
	assert.equal(fixture.launches(), 1);
	assert.equal(fixture.purges(), 1);
});

test("resistant restored tabs prevent false readiness", async () => {
	const fixture = loadController({ statuses: [{ ok: true, debugPort: 9224, kind: "page" }],
		purge: { ok: false, closed: 3, remaining: 1 } });
	const result = await fixture.controller.openDebugChrome();
	assert.equal(result.ok, false);
	assert.equal(result.status, "restored_agent_tabs_resisted");
});
