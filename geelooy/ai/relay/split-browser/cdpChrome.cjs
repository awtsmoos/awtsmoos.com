//B"H
// Boruch Hashem
// Blessed is He

const {
	findPageTarget,
	findBrowserTarget
} = require("./debugChromeDiscovery.cjs");
const {
	summarizeDebugCookies
} = require("./debugChromeCookies.cjs");
const {
	launchDebugChrome,
	debugPort,
	discoveryOptions
} = require("./debugChromeLauncher.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");

/**
 * Visible Chrome is the human login chamber. Session material stays inside its
 * private profile; this controller opens, checks readiness, and closes only.
 */
async function openDebugChrome(config = {}) {
	const before = await statusDebugChrome(config);
	if (!before.ok) {
		launchDebugChrome(config);
	}
	return waitForDebugChrome(config, 12000);
}

async function statusDebugChrome(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		return target;
	}
	return {
		ok: true,
		status: "debug_chrome_ready",
		debugPort: target.debugPort,
		targetKind: target.kind,
		cookieCount: null,
		cookieNames: []
	};
}

async function saveDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) {
		return target;
	}
	return summarizeDebugCookies(target, [], "");
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
