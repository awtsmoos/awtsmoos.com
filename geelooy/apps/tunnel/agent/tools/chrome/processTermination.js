// B"H
// Boruch Hashem
// Blessed is He

const Scan = require("./processScan.js");

/**
 * B"H
 *
 * Termination re-verifies exact command identity before every signal. The
 * Awtsmoos renews process and witness together; Awtsmoos.com escalates only the
 * automation root that still wears both requested profile and debug port.
 */
async function terminateExact(row, options = {}) {
	const current = Scan.exactDebugRoots(options).find(item => item.pid === row.pid);
	if (!current || current.command !== row.command) return false;
	try {
		process.kill(row.pid, "SIGTERM");
	} catch {
		return true;
	}
	if (await waitDead(row.pid, Number(options.graceMs || 800))) return true;
	try {
		process.kill(row.pid, "SIGKILL");
	} catch {}
	return waitDead(row.pid, Number(options.killWaitMs || 1200));
}

async function terminateAllExact(options = {}) {
	const reapedPids = [];
	for (const row of Scan.exactDebugRoots(options)) {
		if (await terminateExact(row, options)) {
			reapedPids.push(row.pid);
		}
	}
	return reapedPids;
}

async function reconcileDuplicates(options = {}) {
	const roots = Scan.exactDebugRoots(options);
	if (roots.length <= 1) {
		return {
			keptPid: roots[0]?.pid || null,
			reapedPids: [],
			roots
		};
	}
	const listeners = new Set(Scan.listenerPids(options.port));
	const preferredPid = Number(options.preferredPid || 0);
	const kept = roots.find(row => row.pid === preferredPid && listeners.has(row.pid)) ||
		roots.find(row => listeners.has(row.pid)) ||
		roots.sort((left, right) => left.pid - right.pid)[0];
	const reapedPids = [];
	for (const row of roots) {
		if (row.pid === kept.pid) continue;
		if (await terminateExact(row, options)) {
			reapedPids.push(row.pid);
		}
	}
	return {
		keptPid: kept.pid,
		reapedPids,
		roots
	};
}

async function waitDead(pid, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		try {
			process.kill(pid, 0);
		} catch {
			return true;
		}
		await new Promise(resolve => setTimeout(resolve, 50));
	}
	return false;
}

module.exports = {
	reconcileDuplicates,
	terminateAllExact,
	terminateExact,
	waitDead
};
