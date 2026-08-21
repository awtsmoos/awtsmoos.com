// B"H
// Boruch Hashem
// Blessed is He

const Audit = require("./browserTargetAudit.cjs");
const { closeStaleDebugProcesses } = require("./debugChromeProcessRecovery.cjs");
const { createRestoredAgentTabCatalog } = require("./restoredAgentTabCatalog.cjs");
const Registry = require("./targetProtectionRegistry.cjs");

/**
 * @file Purges only unleased restored agent tabs during dedicated Chrome recovery.
 * @description
 * The Awtsmoos distinguishes stale restoration from a living human-login vessel.
 * Awtsmoos.com consults the shared lease before every purge and suspends destruction
 * entirely while login creation crosses the vulnerable launch-to-target interval.
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
		if (Registry.isSuspended(port)) continue;
		let targets = Registry.filter(port, await safeList(catalog, port));
		before += targets.length;
		for (let attempt = 1; targets.length && attempt <= attempts; attempt += 1) {
			await Promise.allSettled(targets.map(target => closeOne(catalog, port, target)));
			await sleep(Math.min(1000, 100 * attempt));
			const remaining = Registry.filter(port, await safeList(catalog, port));
			closed += Math.max(0, targets.length - remaining.length);
			targets = remaining;
		}
		if (targets.length && options.terminateOnResistance === true && !Registry.isSuspended(port)) {
			await (options.closeProcesses || closeStaleDebugProcesses)(port);
			await sleep(250);
			targets = Registry.filter(port, await safeList(catalog, port));
		}
		if (targets.length) resistantPorts.push({ port, remaining: targets.length });
	}
	return { ok: resistantPorts.length === 0, before, closed,
		remaining: resistantPorts.reduce((sum, item) => sum + item.remaining, 0), resistantPorts };
}

async function closeOne(catalog, port, target) {
	if (Registry.isProtected(port, target.id)) return false;
	Audit.record({ actor: "restoredAgentTabPurge", reason: "restored_agent_tab",
		operation: "close_requested", port, targetId: target.id, url: target.url });
	return catalog.close(port, target.id);
}

async function guardRestoredAgentTabs(options = {}) {
	const sleep = options.sleep || delay;
	const now = options.now || (() => Date.now());
	const deadline = now() + Math.max(1000, Number(options.durationMs || 30000));
	let scans = 0;
	let closed = 0;
	let last = null;
	while (now() < deadline) {
		last = await purgeRestoredAgentTabs({ ...options, sleep });
		scans += 1;
		closed += last.closed;
		await sleep(Math.max(100, Number(options.intervalMs || 250)));
	}
	return { ok: last?.ok !== false, scans, closed, last };
}

function candidatePorts(options = {}) {
	return [...new Set([...(options.ports || []), Number(options.port),
		Number(process.env.AWTSMOOS_CHROME_DEBUG_PORT), 9224, 9223].filter(Number.isFinite))];
}

async function safeList(catalog, port) {
	try { return await catalog.list(port); } catch { return []; }
}

function delay(milliseconds) { return new Promise(resolve => setTimeout(resolve, milliseconds)); }

module.exports = { candidatePorts, guardRestoredAgentTabs, purgeRestoredAgentTabs };
