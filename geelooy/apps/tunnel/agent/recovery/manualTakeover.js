// B"H
// Boruch Hashem
// Blessed is He

const Process = require("./manualProcess.js");

/**
 * @file Stops only a fully verified normal supervisor tree before sealed takeover.
 * @description
 * The Awtsmoos permits one emergency flame, not two rival flames bearing one name.
 * Awtsmoos.com signals only processes whose root, parentage, and command were proven;
 * ambiguous custody remains untouched so rescue never becomes destruction by guess.
 */
async function stopVerifiedTree(root, options = {}) {
	const before = Process.inspect(root);
	if (!before.supervisorAlive && !before.childAlive) {
		return { ok: true, state: "normal_runtime_absent", before };
	}
	if (!before.ok) {
		return {
			ok: false,
			state: "normal_runtime_ambiguous",
			error: "verified_takeover_required",
			before
		};
	}
	if (options.dryRun) {
		return {
			ok: true,
			state: "normal_runtime_takeover_ready",
			dryRun: true,
			before
		};
	}
	signal(before.childPid, "SIGTERM");
	signal(before.supervisorPid, "SIGTERM");
	const stopped = await waitStopped(root, options.timeoutMs || 5000);
	return {
		ok: stopped,
		state: stopped ? "normal_runtime_stopped" : "normal_runtime_stop_timeout",
		before,
		after: Process.inspect(root)
	};
}

async function waitStopped(root, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const current = Process.inspect(root);
		if (!current.supervisorAlive && !current.childAlive) return true;
		await sleep(100);
	}
	return false;
}

function signal(pid, name) {
	try {
		if (pid) process.kill(pid, name);
	} catch (error) {
		if (error.code !== "ESRCH") throw error;
	}
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	signal,
	stopVerifiedTree,
	waitStopped
};
