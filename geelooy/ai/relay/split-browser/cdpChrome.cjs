//B"H
// Boruch Hashem
// Blessed is He

const {
	findPageTarget,
	findBrowserTarget
} = require("./debugChromeDiscovery.cjs");
const {
	readDebugCookies,
	storeDebugCookies,
	summarizeDebugCookies
} = require("./debugChromeCookies.cjs");
const {
	launchDebugChrome,
	debugPort,
	discoveryOptions
} = require("./debugChromeLauncher.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");

/**
 * Visible Chrome is the human login chamber; CDP only synchronizes cookies and
 * closes the owned browser. No click, typing, selector, focus, or DOM read occurs.
 */
async function openDebugChrome(config = {}) {
	const before = await statusDebugChrome(config);
	if (!before.ok) {
		launchDebugChrome(config);
	}
	const ready = await waitForDebugChrome(config, 12000);
	return ready.ok ? saveDebugCookies(config) : ready;
}

async function statusDebugChrome(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		return target;
	}
	const payload = await readDebugCookies(config).catch(error => ({
		cookies: [],
		error: error.message
	}));
	return summarizeDebugCookies(target, payload.cookies || [], payload.error || "");
}

async function saveDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		return target;
	}
	const payload = await readDebugCookies(config).catch(error => ({
		cookies: [],
		error: error.message
	}));
	storeDebugCookies(payload.cookies || []);
	return summarizeDebugCookies(target, payload.cookies || [], payload.error || "");
}

async function closeDebugChrome(config = {}) {
	const port = debugPort(config);
	const target = await findBrowserTarget({ preferredPort: port, onlyPreferred: true });
	if (!target.ok) {
		return { ok: true, status: "debug_chrome_already_closed", debugPort: port };
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	await Promise.race([
		client.send("Browser.close", {}).catch(() => undefined),
		sleep(750)
	]);
	client.close();
	const closed = await waitUntilClosed(port, 5000);
	return {
		ok: closed,
		status: closed ? "debug_chrome_closed" : "debug_chrome_close_failed",
		debugPort: port
	};
}

async function waitForDebugChrome(config, milliseconds) {
	const deadline = Date.now() + milliseconds;
	let last = null;
	while (Date.now() < deadline) {
		last = await statusDebugChrome(config);
		if (last.ok) {
			return last;
		}
		await sleep(350);
	}
	return {
		ok: false,
		status: "debug_chrome_unavailable",
		error: last?.error || "Chrome DevTools did not answer."
	};
}

async function waitUntilClosed(port, milliseconds) {
	const deadline = Date.now() + milliseconds;
	while (Date.now() < deadline) {
		const state = await findBrowserTarget({ preferredPort: port, onlyPreferred: true });
		if (!state.ok) {
			return true;
		}
		await sleep(150);
	}
	return false;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	openDebugChrome,
	statusDebugChrome,
	saveDebugCookies,
	closeDebugChrome
};
