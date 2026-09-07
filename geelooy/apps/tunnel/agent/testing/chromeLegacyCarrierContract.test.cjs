// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Config = require("../lib/config.js");
const Registration = require("../lib/registration.js");
const Cdp = require("../tools/chrome/cdp.js");

const originalLoadConfig = Config.loadConfig;
const originalNavigate = Cdp.navigateAndWait;
const fixtureConfig = {
	allowCommands: true,
	allowWrite: true,
	root: process.cwd(),
	chrome: { enabled: true, port: 9444 },
	tools: { browser: true, chrome: true, nodeDom: true, nodeScript: true }
};
Config.loadConfig = () => fixtureConfig;
delete require.cache[require.resolve("../tools/chrome/actions.js")];
const Actions = require("../tools/chrome/actions.js");
const Registry = require("../tools/chrome/index.js");
const Group = require("../tools/fs/actionGroups/chromeActions.js");
const { chromeSchema } = require("../lib/tool-schema/nonfs.js");

/**
 * @file Proves legacy URL carriers still converge through native and node-dom browser engines.
 * @description
 * The Awtsmoos accepts old names without losing the exact modern route; Awtsmoos.com
 * binds manifest discovery to a real project root and rejects navigation without a URL.
 */
(async () => {
	const calls = [];
	Cdp.navigateAndWait = async url => {
		calls.push(url);
		return { ok: true, href: url, chromeTargetId: "carrier-contract-target" };
	};
	try {
		const carriers = ["url", "href", "targetUrl", "p", "path"];
		for (const [index, carrier] of carriers.entries()) {
			const url = `https://example.test/${carrier}/${index}`;
			assert.equal(Actions.urlOf({ [carrier]: url }, ""), url);
			const direct = await Actions.chromeNavigate({ [carrier]: url, port: 9444 });
			assert.equal(direct.ok, true, JSON.stringify(direct));
			assert.equal(calls.at(-1), url);
			const virtual = await Group.execute("chromeNavigate", {
				engine: "node-dom",
				[carrier]: url,
				html: `<h1>${carrier}</h1>`
			});
			assert.equal(virtual.href, url);
		}
		const nested = "https://example.test/nested";
		assert.equal(Actions.urlOf({ params: { p: nested } }, ""), nested);
		const missing = await Actions.chromeNavigate({ port: 9444 });
		assert.equal(missing.ok, false);
		assert.equal(missing.error, "missing_navigation_url");
		const missingVirtual = await Group.execute("chromeNavigate", {
			engine: "node-dom",
			html: "<h1>none</h1>"
		});
		assert.equal(missingVirtual.error, "browser_navigation_url_required");
		const schema = chromeSchema("chromeNavigate");
		for (const carrier of carriers) assert.equal(schema.properties[carrier].type, "string");
		assert.equal((schema.required || []).some(field => carriers.includes(field)), false);
		assert.deepEqual([...Registration.BROWSER_ACTIONS].sort(), Object.keys(Registry.ACTIONS).sort());
		const profile = Registration.nativeCapabilityProfile(fixtureConfig);
		assert.equal(profile.capabilities["browser.control"].state, "supported");
		assert.deepEqual(profile.capabilities["browser.control"].actions.sort(), Object.keys(Registry.ACTIONS).sort());
		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-legacy-carrier-contract",
			carriers,
			registrationMatchesRealSurface: true
		}, null, 2));
	} finally {
		Config.loadConfig = originalLoadConfig;
		Cdp.navigateAndWait = originalNavigate;
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
