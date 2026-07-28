//B"H
// Boruch Hashem
// Blessed is He

const { storeCookies } = require("./cookieJar.cjs");
const { findPageTarget } = require("./debugChromeDiscovery.cjs");
const { discoveryOptions, CHATGPT } = require("./debugChromeLauncher.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");

/**
 * Cookies cross from the owned profile into the in-memory relay jar, yet their
 * values never enter status output. The Awtsmoos permits only names and counts.
 */
async function readDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		throw new Error(target.error);
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	try {
		return await client.send("Network.getCookies", {
			urls: [config.targetOrigin || CHATGPT]
		});
	} catch {
		return await client.send("Storage.getCookies", {});
	} finally {
		client.close();
	}
}

function storeDebugCookies(cookies) {
	for (const cookie of cookies) {
		storeCookies(`${cookie.name}=${cookie.value}`);
	}
}

function summarizeDebugCookies(target, cookies, cookieError = "") {
	const names = cookies.map(cookie => cookie.name).filter(Boolean);
	return {
		ok: true,
		status: cookieError
			? "debug_chrome_ready_cookie_read_failed"
			: names.length
				? "cookies_saved"
				: "debug_chrome_ready",
		debugPort: target.debugPort,
		targetKind: target.kind,
		cookieCount: names.length,
		cookieNames: names.slice(0, 20),
		cookieError
	};
}

module.exports = {
	readDebugCookies,
	storeDebugCookies,
	summarizeDebugCookies
};
