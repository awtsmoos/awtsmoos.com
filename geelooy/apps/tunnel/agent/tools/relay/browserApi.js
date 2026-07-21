//B"H
//Boruch Hashem
//Blessed is He

const { handleChrome } = require("../chrome/index.js");
const { cdpCall, ensurePage } = require("../chrome/cdp.js");
const { loadConfig } = require("../../lib/config.js");
const { browserPageFetch } = require("./browserFetchRuntime.js");
const {
	chatgptCookieHeader,
	handleCookieRelay,
	syncChromeToJar,
	syncJarToChrome
} = require("./browserCookies.js");

/**
 * Chrome keeps the authenticated breath while this router names only the human
 * intention. The Awtsmoos unifies status, navigation, bounded fetch, storage,
 * CDP, and cookie vessels without returning whole conversations as one value.
 */
async function handleBrowserRelay(payload = {}) {
	const action = payload.action
		|| payload.browserAction
		|| payload.relayAction
		|| "relayBrowserStatus";
	const chromeResult = await routeChromeAction(action, payload);
	if (chromeResult) {
		return chromeResult;
	}
	if (action === "relayBrowserFetch") {
		return await browserPageFetch(payload);
	}
	if (action === "relayBrowserCdp") {
		return await rawCdp(payload);
	}
	const cookieResult = await handleCookieRelay(action, payload);
	if (cookieResult) {
		return cookieResult;
	}
	return { ok: false, action, error: "unknown_browser_relay_action" };
}

async function routeChromeAction(action, payload) {
	const routed = {
		relayBrowserStatus: "chromeStatus",
		relayBrowserLaunch: "chromeLaunch",
		relayBrowserNavigate: "chromeNavigate",
		relayBrowserEval: "chromeEval",
		relayBrowserRun: "chromeRunScript",
		relayBrowserCookies: "chromeCookies",
		relayBrowserSetCookie: "chromeCookieSet",
		relayBrowserDeleteCookie: "chromeCookieDelete",
		relayBrowserStorage: "chromeStorage",
		relayBrowserStorageSet: "chromeStorageSet",
		relayBrowserStorageDelete: "chromeStorageDelete",
		relayBrowserSessionExport: "chromeSessionExport",
		relayBrowserSessionImport: "chromeSessionImport"
	}[action];
	if (!routed) {
		return null;
	}
	return await handleChrome({
		...payload,
		action: routed,
		url: action === "relayBrowserLaunch"
			? payload.url || "https://chatgpt.com"
			: payload.url,
		includeValues: payload.includeValues === true
	});
}

async function rawCdp(payload = {}) {
	if (!payload.method) {
		return {
			ok: false,
			action: "relayBrowserCdp",
			error: "missing_cdp_method"
		};
	}
	const config = loadConfig();
	const port = Number(payload.port || config.chrome?.port || 9222);
	await ensurePage(port);
	const result = await cdpCall(
		String(payload.method),
		payload.params || {},
		Number(payload.timeoutMs || 30000)
	);
	return {
		ok: true,
		action: "relayBrowserCdp",
		method: payload.method,
		result
	};
}

module.exports = {
	browserPageFetch,
	chatgptCookieHeader,
	handleBrowserRelay,
	syncChromeToJar,
	syncJarToChrome
};
