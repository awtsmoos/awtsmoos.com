//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file Verifies one Shared AI Chrome incarnation after cleanup and keeper repair.
 * @description
 * The Awtsmoos carries the registered PID through the final DevTools ownership
 * check. A dynamic port without its exact owner is never considered browser truth.
 */
async function prepare(config, state, runtime) {
	const port = state.debugPort || await runtime.debugPort(config);
	const purge = await runtime.purge({
		port,
		ports: [port],
		terminateOnResistance: state.launch?.reused === false
	});
	if (!purge.ok) {
		return {
			ok: false,
			status: "restored_agent_tabs_resisted",
			error: `Restored agent tabs remained: ${purge.remaining}`,
			purge
		};
	}
	const keeper = await runtime.keeper(port);
	const authority = await runtime.authority(config);
	if (!authority.ok || authority.port !== port) {
		return {
			ok: false,
			status: "device_browser_authority_lost",
			purge,
			keeper
		};
	}
	const browser = await runtime.findBrowser({
		preferredPort: port,
		onlyPreferred: true,
		expectedPid: authority.pid,
		incarnationId: authority.incarnationId
	});
	if (!browser.ok) {
		return {
			ok: false,
			status: "debug_chrome_lost_after_purge",
			error: browser.error || "Chrome exited after keeper reconciliation.",
			purge,
			keeper
		};
	}
	return {
		...state,
		ok: true,
		status: "debug_chrome_ready",
		debugPort: port,
		host: authority.host,
		pid: authority.pid,
		incarnationId: authority.incarnationId,
		generation: authority.generation,
		targetKind: "browser",
		restoredAgentTabsClosed: purge.closed,
		restoredAgentTabsRemaining: 0,
		keeper
	};
}

module.exports = { prepare };
