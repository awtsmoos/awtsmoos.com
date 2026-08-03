// B"H
const assert = require("node:assert/strict");

const Config = require("../lib/config.js");
const Registration = require("../lib/registration.js");
const Cdp = require("../tools/chrome/cdp.js");

const originalLoadConfig = Config.loadConfig;
const originalNavigateAndWait = Cdp.navigateAndWait;

Config.loadConfig = () => ({
	allowCommands: true,
	chrome: { enabled: true, port: 9444 },
	tools: { browser: true, chrome: true, nodeDom: true, nodeScript: true }
});
delete require.cache[require.resolve("../tools/chrome/actions.js")];
const Actions = require("../tools/chrome/actions.js");
const ChromeRegistry = require("../tools/chrome/index.js");
const ChromeActionGroup = require("../tools/fs/actionGroups/chromeActions.js");
const { chromeSchema } = require("../lib/tool-schema/nonfs.js");

(async () => {
	const calls = [];
	Cdp.navigateAndWait = async (url, timeoutMs, port, options) => {
		calls.push({ url, timeoutMs, port, options });
		return {
			ok: true,
			href: url,
			chromeTargetId: "carrier-contract-target"
		};
	};
	try {
		const carriers = ["url", "href", "targetUrl", "p", "path"];
		for (const [index, carrier] of carriers.entries()) {
			const url = `https://example.test/${carrier}/${index}`;
			assert.equal(Actions.urlOf({ [carrier]: url }, ""), url);
			const direct = await Actions.chromeNavigate({ [carrier]: url, port: 9444 });
			assert.equal(direct.ok, true, JSON.stringify(direct));
			assert.equal(direct.reportedUrl, url);
			assert.equal(direct.verifiedHref, url);
			assert.equal(calls.at(-1).url, url);

			const nestedUrl = `${url}/nested`;
			assert.equal(Actions.urlOf({ params: { [carrier]: nestedUrl } }, ""), nestedUrl);
			const nested = await Actions.chromeNavigate({
				params: { [carrier]: nestedUrl, port: 9444 }
			});
			assert.equal(nested.ok, true, JSON.stringify(nested));
			assert.equal(calls.at(-1).url, nestedUrl);
		}

		const legacyFallback = "https://example.test/legacy-fallback";
		assert.equal(Actions.urlOf({ url: "", p: legacyFallback }, ""), legacyFallback);
		assert.equal(Actions.urlOf({ url: "   ", path: legacyFallback }, ""), legacyFallback);
		assert.equal(Actions.urlOf({ url: "", params: { href: legacyFallback } }, ""), legacyFallback);

		const callsBeforeMissing = calls.length;
		const missing = await Actions.chromeNavigate({ port: 9444 });
		assert.equal(missing.ok, false);
		assert.equal(missing.error, "missing_navigation_url");
		assert.equal(missing.reportedUrl, "");
		assert.equal(calls.length, callsBeforeMissing, "missing URL must not reach CDP");
		assert.equal(JSON.stringify(missing).includes("about:blank"), false);

		for (const carrier of carriers) {
			const url = `https://example.test/virtual/${carrier}`;
			const virtual = await ChromeActionGroup.execute("chromeNavigate", {
				engine: "node-dom",
				[carrier]: url,
				html: `<h1>${carrier}</h1>`
			});
			assert.equal(virtual.ok, true, JSON.stringify(virtual));
			assert.equal(virtual.href, url);
		}
		const nestedVirtual = await ChromeActionGroup.execute("chromeNavigate", {
			engine: "node-dom",
			params: JSON.stringify({ p: "https://example.test/virtual/nested-p" }),
			html: "<h1>nested p</h1>"
		});
		assert.equal(nestedVirtual.ok, true, JSON.stringify(nestedVirtual));
		assert.equal(nestedVirtual.href, "https://example.test/virtual/nested-p");
		const missingVirtual = await ChromeActionGroup.execute("chromeNavigate", {
			engine: "node-dom",
			html: "<h1>must not navigate</h1>"
		});
		assert.equal(missingVirtual.ok, false);
		assert.equal(missingVirtual.error, "browser_navigation_url_required");
		assert.equal(JSON.stringify(missingVirtual).includes("about:blank"), false);

		const schema = chromeSchema("chromeNavigate");
		for (const carrier of carriers) {
			assert.equal(schema.properties[carrier].type, "string", carrier);
		}
		assert.equal(
			(schema.required || []).some(field => carriers.includes(field)),
			false,
			"one URL alias must not make another alias fail schema validation"
		);

		assert.deepEqual(
			[...Registration.BROWSER_ACTIONS].sort(),
			Object.keys(ChromeRegistry.ACTIONS).sort()
		);
		const profile = Registration.nativeCapabilityProfile(Config.loadConfig());
		assert.equal(profile.capabilities["browser.control"].state, "supported");
		assert.deepEqual(
			profile.capabilities["browser.control"].actions.sort(),
			Object.keys(ChromeRegistry.ACTIONS).sort()
		);

		const originalHandle = ChromeRegistry.handleChrome;
		ChromeRegistry.handleChrome = async payload => ({ ...payload, received: true });
		try {
			for (const carrier of carriers) {
				const url = `https://example.test/action-group/${carrier}`;
				const action = ChromeActionGroup.buildChromeActions({
					payload: { [carrier]: url }
				}).chromeNavigate;
				const received = await action();
				assert.equal(received.action, "chromeNavigate");
				assert.equal(received[carrier], url);
				assert.equal(received.received, true);
			}
		} finally {
			ChromeRegistry.handleChrome = originalHandle;
		}

		console.log(JSON.stringify({
			ok: true,
			suite: "chrome-legacy-carrier-contract",
			carriers,
			topLevelAndNested: true,
			blankHigherPriorityFallsThrough: true,
			missingUrlRejectedBeforeCdp: true,
			actionGroupPreservesCarrier: true,
			virtualBrowserCarriers: true,
			registrationMatchesRealSurface: true
		}, null, 2));
	} finally {
		Config.loadConfig = originalLoadConfig;
		Cdp.navigateAndWait = originalNavigateAndWait;
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exitCode = 1;
});
