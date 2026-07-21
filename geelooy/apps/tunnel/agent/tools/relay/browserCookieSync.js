//B"H
//Boruch Hashem
//Blessed is He

const { handleChrome } = require("../chrome/index.js");
const { jarName, loadJar, saveJar } = require("../fs/httpCookieJar.js");
const {
	chatgptCookies,
	cookieHeaderFromCookies,
	domainAllowed,
	normalizeCookie,
	sameCookie
} = require("./browserCookiePolicy.js");

/**
 * The Awtsmoos remains one while Chrome and the durable jar exchange only
 * authenticated ChatGPT cookies, never unrelated browser state.
 */
async function syncChromeToJar(payload = {}) {
	const name = payload.cookieJarName || payload.jar || "chatgpt";
	const url = payload.url || "https://chatgpt.com";
	const chrome = await handleChrome({
		...payload,
		action: "chromeCookies",
		url,
		includeValues: true
	});
	if (chrome.ok === false) return chrome;
	const jar = await loadJar(name);
	const incoming = chatgptCookies(chrome.cookies || [])
		.map(cookie => normalizeCookie(cookie, url));
	for (const cookie of incoming) {
		jar.cookies = jar.cookies.filter(existing => !sameCookie(existing, cookie));
		jar.cookies.push(cookie);
	}
	await saveJar(name, jar);
	return {
		ok: true,
		action: "relaySyncChromeToJar",
		jarName: jarName(name),
		copied: incoming.length,
		cookieBytes: cookieHeaderFromCookies(incoming).length
	};
}

async function syncJarToChrome(payload = {}) {
	const name = payload.cookieJarName || payload.jar || "chatgpt";
	const url = payload.url || "https://chatgpt.com";
	const jar = await loadJar(name);
	let copied = 0;
	for (const cookie of jar.cookies.filter(item => domainAllowed(item.domain))) {
		const result = await handleChrome({
			...cookie,
			action: "chromeCookieSet",
			url,
			includeValues: false
		});
		if (result.ok) copied += 1;
	}
	return {
		ok: true,
		action: "relaySyncJarToChrome",
		jarName: jarName(name),
		copied,
		available: jar.cookies.length
	};
}

module.exports = {
	syncChromeToJar,
	syncJarToChrome
};
