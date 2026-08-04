// B"H
// Boruch Hashem
// Blessed is He

const { findBrowserTarget, findPageTarget } = require("./debugChromeDiscovery.cjs");
const { summarizeDebugCookies } = require("./debugChromeCookies.cjs");
const { reconcileKeeper } = require("./debugChromeKeeper.cjs");
const { launchDebugChrome, debugPort, discoveryOptions } = require("./debugChromeLauncher.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { closeDebugChrome } = require("./debugChromeShutdown.cjs");
const { purgeRestoredAgentTabs } = require("./restoredAgentTabPurge.cjs");

/**
 * @file Makes browser readiness follow the authenticated profile's actual owner port.
 * @description
 * The Awtsmoos reuses port 9223 when Chrome's singleton already owns the profile,
 * purges restored agent pages, normalizes one inert keeper, and only then permits a
 * final-URL target to be born for one accepted prompt dispatch.
 */
async function openDebugChrome(config = {}) {
	const before = await statusDebugChrome(config);
	if (before.ok) return prepareReady(config, before);
	const firstLaunch = await launchDebugChrome(config);
	const firstConfig = { ...config, debugPort: firstLaunch.debugPort };
	const first = await waitForDebugChrome(firstConfig, 15000);
	if (first.ok) return prepareReady(firstConfig, { ...first, launch: firstLaunch });
	const port = firstLaunch.debugPort || debugPort(config);
	const recovery = await closeStaleDebugProcesses(port);
	await sleep(recovery.closed ? 750 : 250);
	const secondLaunch = await launchDebugChrome(firstConfig);
	const secondConfig = { ...firstConfig, debugPort: secondLaunch.debugPort };
	const second = await waitForDebugChrome(secondConfig, 20000);
	if (!second.ok) {
		return { ...second, recoveryAttempted: true,
			staleProcessesClosed: recovery.closed, launch: secondLaunch };
	}
	const ready = await prepareReady(secondConfig, { ...second, launch: secondLaunch });
	return { ...ready, recoveryAttempted: true, staleProcessesClosed: recovery.closed };
}

async function prepareReady(config, state) {
	const port = state.debugPort || debugPort(config);
	const purge = await purgeRestoredAgentTabs({
		port,
		ports: [port],
		terminateOnResistance: true
	});
	if (!purge.ok) {
		return { ok: false, status: "restored_agent_tabs_resisted",
			error: `Restored agent tabs remained: ${purge.remaining}`, purge };
	}
	const keeper = await reconcileKeeper(port);
	const browser = await findBrowserTarget({ preferredPort: port, onlyPreferred: true });
	if (!browser.ok) {
		return { ok: false, status: "debug_chrome_lost_after_purge",
			error: browser.error || "Chrome exited after keeper reconciliation.", purge, keeper };
	}
	process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(port);
	return { ...state, ok: true, status: "debug_chrome_ready", debugPort: port,
		targetKind: "browser", restoredAgentTabsClosed: purge.closed,
		restoredAgentTabsRemaining: 0, keeper };
}

async function statusDebugChrome(config = {}) {
	const target = await findBrowserTarget(discoveryOptions(config));
	if (!target.ok) return target;
	return { ok: true, status: "debug_chrome_ready", debugPort: target.debugPort,
		targetKind: "browser", browser: target.browser || "Chrome" };
}

async function saveDebugCookies(config = {}) {
	const target = await findPageTarget(discoveryOptions(config));
	return target.ok ? summarizeDebugCookies(target, [], "") : target;
}

async function waitForDebugChrome(config, milliseconds) {
	const deadline = Date.now() + milliseconds;
	let last = null;
	while (Date.now() < deadline) {
		last = await statusDebugChrome(config);
		if (last.ok) return last;
		await sleep(250);
	}
	return { ok: false, status: "debug_chrome_unavailable",
		error: last?.error || "Chrome DevTools did not answer." };
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { closeDebugChrome, openDebugChrome, saveDebugCookies, statusDebugChrome };
