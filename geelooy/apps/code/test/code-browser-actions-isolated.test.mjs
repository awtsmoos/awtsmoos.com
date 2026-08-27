// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	CODE_BROWSER_WELCOME_URL,
	normalizeAddress,
	normalizeAgentAddress
} from "../js/browser/runtime/address.js";
import { BrowserTargetRegistry } from "../js/browser/target-registry.js";
import { handleCodeChromeAction } from "../js/browser/chrome-actions.js";

/**
 * B"H
 * Chrome-shaped actions must select the Code browser, reject blank navigation,
 * preserve useful welcome state, and never fall silently into about:blank.
 */
globalThis.CustomEvent ||= class CustomEvent extends Event {
	constructor(type, options = {}) {
		super(type);
		this.detail = options.detail;
	}
};

assert.equal(normalizeAddress(""), CODE_BROWSER_WELCOME_URL);
assert.equal(normalizeAddress("about:blank"), CODE_BROWSER_WELCOME_URL);
assert.throws(() => normalizeAgentAddress(""), /browser_navigation_url_required/);
assert.throws(() => normalizeAgentAddress("about:blank"), /about_blank_rejected/);
assert.equal(
	normalizeAgentAddress("./next", "https://example.com/base/index.html"),
	"https://example.com/base/next"
);

const calls = [];
const target = {
	id: "browser-tab-1",
	type: "code-browser",
	describe: () => ({
		id: "browser-tab-1",
		url: "awtsmoos://welcome"
	}),
	async navigate(url, options) {
		calls.push({ action: "navigate", url, options });
		return {
			ok: true,
			tabId: this.id,
			url
		};
	},
	click(selector) {
		calls.push({ action: "click", selector });
		return { ok: true, selector };
	},
	type(selector, text) {
		calls.push({ action: "type", selector, text });
		return { ok: true, selector, value: text };
	},
	find(text) {
		return { ok: true, found: text === "Awtsmoos" };
	},
	waitForSelector(selector) {
		return { ok: true, selector };
	},
	snapshot() {
		return { ok: true, title: "Code Browser" };
	},
	evaluate(script) {
		return { ok: true, value: script.length };
	}
};
BrowserTargetRegistry.register(target);

const navigation = await handleCodeChromeAction({
	action: "chromeNavigate",
	url: "https://example.com"
});
assert.equal(navigation.ok, true);
assert.equal(navigation.tabId, "browser-tab-1");
assert.equal(calls[0].options.strict, true);
await handleCodeChromeAction({ action: "chromeClick", selector: "#go" });
await handleCodeChromeAction({ action: "chromeType", selector: "#name", text: "B\"H" });
assert.deepEqual(calls.map(call => call.action), ["navigate", "click", "type"]);

const status = await handleCodeChromeAction({ action: "chromeStatus" });
assert.equal(status.activeTargetId, "browser-tab-1");
assert.equal(status.targets.length, 1);
BrowserTargetRegistry.unregister("browser-tab-1");

console.log(JSON.stringify({
	ok: true,
	suite: "code-browser-actions-isolated",
	blankRejected: true,
	customTargetSelected: true,
	chromeActionsRouted: true
}, null, 2));
