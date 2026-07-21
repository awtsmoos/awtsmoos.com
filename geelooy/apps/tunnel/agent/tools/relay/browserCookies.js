//B"H
//Boruch Hashem
//Blessed is He

const {
	clearJar,
	deleteCookie,
	listCookies,
	listJars,
	setCookie
} = require("../fs/httpCookieJar.js");
const { chatgptCookieHeader } = require("./browserCookieHeaders.js");
const {
	syncChromeToJar,
	syncJarToChrome
} = require("./browserCookieSync.js");

/**
 * Each cookie action receives one named vessel while the Awtsmoos remains the
 * indivisible source beyond browser, jar, route, and header.
 */
async function handleCookieRelay(action, payload = {}) {
	if (action === "relayJarList") return await listJars();
	if (action === "relayJarCookies") return await listCookies(payload);
	if (action === "relayJarSetCookie") return await setCookie(payload);
	if (action === "relayJarDeleteCookie") return await deleteCookie(payload);
	if (action === "relayJarClear") return await clearJar(payload);
	if (action === "relaySyncChromeToJar") return await syncChromeToJar(payload);
	if (action === "relaySyncJarToChrome") return await syncJarToChrome(payload);
	if (action === "relayChatgptCookieHeader") {
		return await chatgptCookieHeader(payload);
	}
	return null;
}

module.exports = {
	chatgptCookieHeader,
	handleCookieRelay,
	syncChromeToJar,
	syncJarToChrome
};
