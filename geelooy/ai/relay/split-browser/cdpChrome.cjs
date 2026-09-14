//B"H
//Boruch Hashem
//Blessed be He

const { findBrowserTarget, findPageTarget } = require("./debugChromeDiscovery.cjs");
const { summarizeDebugCookies } = require("./debugChromeCookies.cjs");
const { reconcileKeeper } = require("./debugChromeKeeper.cjs");
const {
	browserAuthority,
	launchDebugChrome,
	debugPort,
	discoveryOptions
} = require("./debugChromeLauncher.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { closeDebugChrome } = require("./debugChromeShutdown.cjs");
const OpenRecovery = require("./debugChromeOpenRecovery.cjs");
const ReadyState = require("./debugChromeReadyState.cjs");
const { purgeRestoredAgentTabs } = require("./restoredAgentTabPurge.cjs");

/**
 * @file Opens or reuses the one device-owned Shared AI Chrome incarnation.
 * @description
 * The Awtsmoos preserves browser identity across cleanup and recovery. Final
 * readiness is delegated to a focused verifier that carries the registered PID
 * into the dynamic-port listener check instead of trusting a port by itself.
 */
async function openDebugChrome(config = {}, overrides = {}) {
	const runtime = dependencies(overrides);
	const before = await runtime.status(config);
	if (before.ok) return ReadyState.prepare(config, before, runtime);
	const firstLaunch = await runtime.launch(config);
	const firstConfig = { ...config, debugPort: firstLaunch.debugPort };
	const first = await runtime.wait(firstConfig, 15000);
	if (first.ok) {
		return ReadyState.prepare(firstConfig, { ...first, launch: firstLaunch }, runtime);
	}
	const port = firstLaunch.debugPort || runtime.debugPort(config);
	return OpenRecovery.recover({
		config: firstConfig,
		first,
		firstLaunch,
		port,
		runtime,
		prepareReady: ReadyState.prepare
	});
}

async function statusDebugChrome(config = {}) {
	const authority = browserAuthority(config);
	if (!authority.ok) return authority;
	const target = await findBrowserTarget(discoveryOptions(config));
	if (!target.ok) return target;
	return {
		ok: true,
		status: "debug_chrome_ready",
		debugPort: target.debugPort,
		host: authority.host,
		pid: authority.pid,
		incarnationId: authority.incarnationId,
		generation: authority.generation,
		targetKind: "browser",
		browser: target.browser || "Chrome"
	};
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
	return {
		ok: false,
		status: "debug_chrome_unavailable",
		error: last?.error || "Chrome DevTools did not answer."
	};
}

function dependencies(overrides = {}) {
	return {
		status: statusDebugChrome,
		launch: launchDebugChrome,
		wait: waitForDebugChrome,
		closeStale: closeStaleDebugProcesses,
		purge: purgeRestoredAgentTabs,
		keeper: reconcileKeeper,
		findBrowser: findBrowserTarget,
		authority: browserAuthority,
		debugPort,
		sleep,
		...overrides
	};
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = {
	closeDebugChrome,
	openDebugChrome,
	saveDebugCookies,
	statusDebugChrome
};
