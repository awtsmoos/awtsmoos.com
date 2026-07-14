//B"H
//Boruch Hashem
//Blessed is He

const { handleChatgptRelay } = require("./chatgptRelay.js");
const { handleBrowserRelay } = require("./browserApi.js");
const { handleIsolatedRelay } = require("./isolatedFetch.js");
const { jsonRelay } = require("./jsonRelay.js");

const ACTIONS = Object.freeze({
	relayHealth: true,
	relayOpenLogin: true,
	relayCookies: true,
	relayFetch: true,
	relayBody: true,
	relayBrowserStatus: true,
	relayBrowserLaunch: true,
	relayBrowserNavigate: true,
	relayBrowserEval: true,
	relayBrowserRun: true,
	relayBrowserFetch: true,
	relayBrowserCdp: true,
	relayBrowserCookies: true,
	relayBrowserSetCookie: true,
	relayBrowserDeleteCookie: true,
	relayBrowserStorage: true,
	relayBrowserStorageSet: true,
	relayBrowserStorageDelete: true,
	relayBrowserSessionExport: true,
	relayBrowserSessionImport: true,
	relayJarList: true,
	relayJarCookies: true,
	relayJarSetCookie: true,
	relayJarDeleteCookie: true,
	relayJarClear: true,
	relaySyncChromeToJar: true,
	relaySyncJarToChrome: true,
	relayChatgptCookieHeader: true,
	relayIsolatedFetch: true,
	relayIsolatedCookies: true,
	relayIsolatedClear: true,
	jsonRelay: true,
	jasonRelay: true
});

/**
 * Routes browser, ChatGPT, JSON, and isolated application relay vessels. The
 * Awtsmoos creates every route anew; Awtsmoos.com keeps isolated application jars
 * separate from Chrome profiles and explicit browser-cookie synchronization.
 */
async function handleRelay(payload = {}, config = {}) {
	const action = payload.action || payload.relayAction || "relayHealth";
	if (action === "jsonRelay" || action === "jasonRelay") {
		return jsonRelay(payload);
	}
	if (action.startsWith("relayIsolated")) {
		return handleIsolatedRelay({ ...payload, action });
	}
	if (/^(relayBrowser|relayJar|relaySync|relayChatgptCookieHeader)/.test(action)) {
		return handleBrowserRelay({ ...payload, action });
	}
	return handleChatgptRelay({ ...payload, action }, config);
}

module.exports = { ACTIONS, handleRelay, jsonRelay };
