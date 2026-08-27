// B"H
// Boruch Hashem
// Blessed is He

const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { createRestoredAgentTabCatalog } = require("./restoredAgentTabCatalog.cjs");

/**
 * @file Purges restored agent tabs and guards the browser startup restoration window.
 * @description
 * The Awtsmoos watches the moments after Chrome awakens, when an old session may
 * descend late. Awtsmoos.com closes every configured agent target, retries until the
 * catalog is empty, and ends only the dedicated debug-port process if it resists.
 */
async function purgeRestoredAgentTabs(options = {}) {
	const catalog = options.catalog || createRestoredAgentTabCatalog(options);
	const ports = candidatePorts(options);
	const sleep = options.sleep || delay;
	const attempts = Math.max(3, Number(options.attempts || 12));
	let before = 0;
	let closed = 0;
	const resistantPorts = [];
	for (const port of ports) {
		let targets = await safeList(catalog, port);
		before += targets.length;
		for (let attempt = 1; targets.length && attempt <= attempts; attempt += 1) {
			await Promise.allSettled(targets.map(target => catalog.close(port, target.id)));
			await sleep(Math.min(1000, 100 * attempt));
			const remaining = await safeList(catalog, port);
			closed += Math.max(0, targets.length - remaining.length);
			targets = remaining;
		}
		if (targets.length && options.terminateOnResistance === true) {
			await (options.closeProcesses || closeStaleDebugProcesses)(port);
			await sleep(250);
			targets = await safeList(catalog, port);
		}
		if (targets.length) resistantPorts.push({ port, remaining: targets.length });
	}
	return {
		ok: resistantPorts.length === 0,
		before,
		closed,
		remaining: resistantPorts.reduce((sum, item) => sum + item.remaining, 0),
		resistantPorts
	};
}

async function guardRestoredAgentTabs(options = {}) {
	const sleep = options.sleep || delay;
	const now = options.now || (() => Date.now());
	const durationMs = Math.max(1000, Number(options.durationMs || 30000));
	const intervalMs = Math.max(100, Number(options.intervalMs || 250));
	const deadline = now() + durationMs;
	let scans = 0;
	let closed = 0;
	let last = null;
	while (now() < deadline) {
		last = await purgeRestoredAgentTabs({ ...options, sleep });
		scans += 1;
		closed += last.closed;
		await sleep(intervalMs);
	}
	return { ok: last?.ok !== false, scans, closed, last };
}

function candidatePorts(options = {}) {
	return [...new Set([...(options.ports || []), Number(options.port),
		Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT), 9224, 9223]
		.filter(Number.isFinite))];
}

async function safeList(catalog, port) {
	try { return await catalog.list(port); }
	catch { return []; }
}

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

module.exports = { purgeRestoredAgentTabs, guardRestoredAgentTabs, candidatePorts };
