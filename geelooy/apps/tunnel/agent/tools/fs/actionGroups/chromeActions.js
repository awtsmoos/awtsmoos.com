// B"H
const Chrome = require("../../chrome/index.js");
const { wantsVirtualChrome, virtualChrome } = require("./virtualChromeActions.js");
const { VIRTUAL_BROWSER_ACTIONS } = require("../../../lib/registration.js");

const ACTIONS = Object.keys(Chrome.ACTIONS);
const VIRTUAL_SAFE = new Set(VIRTUAL_BROWSER_ACTIONS);

/**
 * The native action surface is generated from the same authoritative Chrome
 * registry advertised during tunnel registration. Awtsmoos.com therefore never
 * claims browser.control while silently omitting cookies, storage, target leases,
 * diagnostics, screenshots, accessibility, or network inspection.
 */
function buildChromeActions(ctx) {
	const payload = ctx.payload || {};
	return Object.fromEntries(ACTIONS.map(action => [
		action,
		async () => execute(action, payload)
	]));
}

async function execute(action, payload) {
	if (!wantsVirtualChrome(payload)) {
		return Chrome.handleChrome({ ...payload, action });
	}
	if (action === "chromeStop" || action === "chromeClosePage") {
		return { ok: true, action, engine: "node-dom", alreadyStopped: true };
	}
	if (action === "chromeCloseTabs") {
		return { ok: true, action, engine: "node-dom", closedCount: 0 };
	}
	if (action === "chromeLogs" || action === "chromeNetwork") {
		return { ok: true, action, engine: "node-dom", logs: [], entries: [] };
	}
	if (action === "chromeScreenshot") {
		return { ok: false, action, error: "virtual_chrome_no_pixels" };
	}
	if (VIRTUAL_SAFE.has(action)) return virtualChrome(action, payload);
	return {
		ok: false,
		action,
		error: "virtual_chrome_action_unsupported",
		nativeBrowserRequired: true
	};
}

module.exports = { ACTIONS, buildChromeActions, execute };
