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

/** Opens one persistent dedicated Chrome without killing an owner this call reused. */
async function openDebugChrome(config = {}, overrides = {}) {
	const runtime = dependencies(overrides);
	const before = await runtime.status(config);
	if (before.ok) return prepareReady(config, before, runtime);
	const firstLaunch = await runtime.launch(config);
	const firstConfig = { ...config, debugPort: firstLaunch.debugPort };
	const first = await runtime.wait(firstConfig, 15000);
	if (first.ok) {
		return prepareReady(firstConfig, { ...first, launch: firstLaunch }, runtime);
	}
	const port = firstLaunch.debugPort || debugPort(config);
	if (firstLaunch.reused !== false) {
		return { ...first, status: "debug_chrome_reused_owner_unresponsive",
			error: first.error || "The reused Chrome owner did not answer DevTools.",
			debugPort: port, launch: firstLaunch, ownerPreserved: true,
			recoveryAttempted: false };
	}
	const recovery = await runtime.closeStale(port);
	await runtime.sleep(recovery.closed ? 750 : 250);
	const secondLaunch = await runtime.launch(firstConfig);
	const secondConfig = { ...firstConfig, debugPort: secondLaunch.debugPort };
	const second = await runtime.wait(secondConfig, 20000);
	if (!second.ok) {
		return { ...second, recoveryAttempted: true,
			staleProcessesClosed: recovery.closed, launch: secondLaunch };
	}
	const ready = await prepareReady(
		secondConfig,
		{ ...second, launch: secondLaunch },
		runtime
	);
	return { ...ready, recoveryAttempted: true, staleProcessesClosed: recovery.closed };
}

async function prepareReady(config, state, runtime = dependencies()) {
	const port = state.debugPort || debugPort(config);
	const purge = await runtime.purge({
		port,
		ports: [port],
		terminateOnResistance: state.launch?.reused === false
	});
	if (!purge.ok) {
		return { ok: false, status: "restored_agent_tabs_resisted",
			error: `Restored agent tabs remained: ${purge.remaining}`, purge };
	}
	const keeper = await runtime.keeper(port);
	const browser = await runtime.findBrowser({ preferredPort: port, onlyPreferred: true });
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

function dependencies(overrides = {}) {
	return { status: statusDebugChrome, launch: launchDebugChrome,
		wait: waitForDebugChrome, closeStale: closeStaleDebugProcesses,
		purge: purgeRestoredAgentTabs, keeper: reconcileKeeper,
		findBrowser: findBrowserTarget, sleep, ...overrides };
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { closeDebugChrome, openDebugChrome, saveDebugCookies, statusDebugChrome };
