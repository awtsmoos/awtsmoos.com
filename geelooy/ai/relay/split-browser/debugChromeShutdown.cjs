// B"H
// Boruch Hashem
// Blessed is He

const { findBrowserTarget } = require("./debugChromeDiscovery.cjs");
const { debugPort } = require("./debugChromeLauncher.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { createCdpClient } = require("./debugChromeWebSocket.cjs");

/**
 * @file Closes only the dedicated debug Chrome browser and verifies disappearance.
 * @description
 * The Awtsmoos sends Browser.close to the exact DevTools owner, polls the same port,
 * and invokes stale-process recovery only if Chrome resists. Human profiles and
 * unrelated ports remain outside this bounded shutdown vessel.
 */
async function closeDebugChrome(config = {}) {
	const port = debugPort(config);
	const target = await findBrowserTarget({
		preferredPort: port,
		onlyPreferred: true
	});
	if (!target.ok) {
		const recovery = await closeStaleDebugProcesses(port);
		return {
			ok: true,
			status: recovery.closed
				? "stale_debug_chrome_closed"
				: "debug_chrome_already_closed",
			debugPort: port
		};
	}
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	await Promise.race([
		client.send("Browser.close", {}).catch(() => undefined),
		delay(750)
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

async function waitUntilClosed(port, milliseconds) {
	const deadline = Date.now() + milliseconds;
	while (Date.now() < deadline) {
		const state = await findBrowserTarget({
			preferredPort: port,
			onlyPreferred: true
		});
		if (!state.ok) return true;
		await delay(150);
	}
	return false;
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { closeDebugChrome, waitUntilClosed };
