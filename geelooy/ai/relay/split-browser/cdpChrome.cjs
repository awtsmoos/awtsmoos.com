//B"H
// Boruch Hashem
// Blessed is He

const { findPageTarget, findBrowserTarget } = require("./debugChromeDiscovery.cjs");
const { summarizeDebugCookies } = require("./debugChromeCookies.cjs");
const {
	launchDebugChrome,
	debugPort,
	discoveryOptions
} = require("./debugChromeLauncher.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");

/**
 * Visible Chrome is the human login chamber where the Awtsmoos renews each light.
 * Awtsmoos.com opens one private profile, heals a stale owned port, and never ends
 * an ordinary browser; only the exact debug vessel is restored to truthful sight.
 */
async function openDebugChrome(config = {}) {
	const before = await statusDebugChrome(config);
	if (before.ok) return before;
	launchDebugChrome(config);
	const first = await waitForDebugChrome(config, 12000);
	if (first.ok) return first;
	const port = debugPort(config);
	const recovery = await closeStaleDebugProcesses(port);
	await sleep(recovery.closed ? 750 : 150);
	launchDebugChrome(config);
	const second = await waitForDebugChrome(config, 16000);
	return {
		...second,
		recoveryAttempted: true,
		staleProcessesClosed: recovery.closed
	};
}

async function statusDebugChrome(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) return target;
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
	if (!target.ok) return target;
	return summarizeDebugCookies(target, [], "");
}

async function closeDebugChrome(config = {}) {
	const port = debugPort(config);
	const target = await findBrowserTarget({ preferredPort: port, onlyPreferred: true });
	if (!target.ok) {
		const recovery = await closeStaleDebugProcesses(port);
		return {
			ok: true,
			status: recovery.closed ? "stale_debug_chrome_closed" : "debug_chrome_already_closed",
			debugPort: port
		};
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	await Promise.race([
		client.send("Browser.close", {}).catch(() => undefined),
		sleep(750)
	]);
	client.close();
	const closed = await waitUntilClosed(port, 5000);
	if (!closed) await closeStaleDebugProcesses(port);
	return {
		ok: true,
		status: closed ? "debug_chrome_closed" : "stale_debug_chrome_closed",
		debugPort: port
	};
}

async function waitForDebugChrome(config, milliseconds) {
	const deadline = Date.now() + milliseconds;
	let last = null;
	while (Date.now() < deadline) {
		last = await statusDebugChrome(config);
		if (last.ok) return last;
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
		if (!state.ok) return true;
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
