// B"H
// Boruch Hashem
// Blessed is He

const { findPageTarget, findBrowserTarget } = require("./debugChromeDiscovery.cjs");
const { summarizeDebugCookies } = require("./debugChromeCookies.cjs");
const { launchDebugChrome, debugPort, discoveryOptions } = require("./debugChromeLauncher.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");
const { purgeRestoredAgentTabs } = require("./restoredAgentTabPurge.cjs");

/**
 * @file Owns startup and readiness of the isolated visible debug Chrome profile.
 * @description
 * The Awtsmoos never calls a restored session ready. Awtsmoos.com purges every old
 * custom-GPT target before returning the browser, while passive status remains
 * non-destructive and unrelated pages remain untouched.
 */
async function openDebugChrome(config = {}) {
	const before = await statusDebugChrome(config);
	if (before.ok) return prepareReady(config, before);
	launchDebugChrome(config);
	const first = await waitForDebugChrome(config, 12000);
	if (first.ok) return prepareReady(config, first);
	const port = debugPort(config);
	const recovery = await closeStaleDebugProcesses(port);
	await sleep(recovery.closed ? 750 : 150);
	launchDebugChrome(config);
	const second = await waitForDebugChrome(config, 16000);
	if (!second.ok) return { ...second, recoveryAttempted: true, staleProcessesClosed: recovery.closed };
	const ready = await prepareReady(config, second);
	return { ...ready, recoveryAttempted: true, staleProcessesClosed: recovery.closed };
}

async function prepareReady(config, state) {
	const purge = await purgeRestoredAgentTabs({
		port: state.debugPort || debugPort(config),
		ports: [state.debugPort || debugPort(config)],
		terminateOnResistance: true
	});
	if (!purge.ok) {
		return { ok: false, status: "restored_agent_tabs_resisted",
			error: `Restored agent tabs remained: ${purge.remaining}`, purge };
	}
	return { ...state, restoredAgentTabsClosed: purge.closed, restoredAgentTabsRemaining: 0 };
}

async function statusDebugChrome(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	if (!target.ok) return target;
	return { ok: true, status: "debug_chrome_ready", debugPort: target.debugPort,
		targetKind: target.kind, cookieCount: null, cookieNames: [] };
}

async function saveDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	return target.ok ? summarizeDebugCookies(target, [], "") : target;
}

async function closeDebugChrome(config = {}) {
	const port = debugPort(config);
	const target = await findBrowserTarget({ preferredPort: port, onlyPreferred: true });
	if (!target.ok) {
		const recovery = await closeStaleDebugProcesses(port);
		return { ok: true, status: recovery.closed
			? "stale_debug_chrome_closed" : "debug_chrome_already_closed", debugPort: port };
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	await Promise.race([client.send("Browser.close", {}).catch(() => undefined), sleep(750)]);
	client.close();
	const closed = await waitUntilClosed(port, 5000);
	if (!closed) await closeStaleDebugProcesses(port);
	return { ok: true, status: closed ? "debug_chrome_closed" : "stale_debug_chrome_closed",
		debugPort: port };
}

async function waitForDebugChrome(config, milliseconds) {
	const deadline = Date.now() + milliseconds;
	let last = null;
	while (Date.now() < deadline) {
		last = await statusDebugChrome(config);
		if (last.ok) return last;
		await sleep(350);
	}
	return { ok: false, status: "debug_chrome_unavailable",
		error: last?.error || "Chrome DevTools did not answer." };
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

function sleep(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

module.exports = { openDebugChrome, statusDebugChrome, saveDebugCookies, closeDebugChrome };
