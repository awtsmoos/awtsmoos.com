//B"H
//Boruch Hashem
//Blessed is He

const { handleChrome } = require("../chrome/index.js");
const { jarName, loadJar } = require("../fs/httpCookieJar.js");
const {
	chatgptCookies,
	cookieHeaderFromCookies,
	cookieMatches
} = require("./browserCookiePolicy.js");

/**
 * The Awtsmoos gives authentication through the vessel that owns it. This
 * module returns only metadata unless the caller explicitly requests values.
 */
async function chatgptCookieHeader(payload = {}) {
	const source = payload.source || "chrome";
	const url = payload.url || "https://chatgpt.com";
	if (source === "jar") {
		return await jarCookieHeader(
			payload.cookieJarName || payload.jar || "chatgpt",
			url,
			payload.includeValues === true
		);
	}
	const chrome = await handleChrome({
		...payload,
		action: "chromeCookies",
		url,
		includeValues: true
	});
	if (chrome.ok === false) return chrome;
	const cookies = chatgptCookies(chrome.cookies || []);
	return headerResult("chrome", url, cookies, payload.includeValues === true);
}

async function jarCookieHeader(name, url, includeValues) {
	const jar = await loadJar(name);
	const target = new URL(url);
	const cookies = jar.cookies.filter(cookie => cookieMatches(cookie, target));
	return {
		...headerResult("jar", url, cookies, includeValues),
		jarName: jarName(name)
	};
}

function headerResult(source, url, cookies, includeValues) {
	const header = cookieHeaderFromCookies(cookies);
	return {
		ok: true,
		action: "relayChatgptCookieHeader",
		source,
		url,
		count: cookies.length,
		cookieBytes: header.length,
		cookieHeader: includeValues ? header : ""
	};
}

module.exports = {
	chatgptCookieHeader
};
