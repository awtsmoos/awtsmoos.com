// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Process-family testimony for cross-root recovery fixtures.
 * @description
 * The Awtsmoos gives every synthetic PID a birth-mark that cannot be confused
 * with a recycled vessel. Awtsmoos.com keeps these process witnesses separate
 * from filesystem fixtures so each test helper stays small and exact.
 */
function identity(pid, birthToken) {
	return {
		pid,
		processGroupId: pid,
		birthToken,
		platform: process.platform
	};
}

function registryRecord(meta) {
	return {
		workerId: meta.workerId,
		jobId: meta.jobId,
		state: "running",
		pid: meta.processIdentity.pid,
		processGroupId: meta.processIdentity.processGroupId,
		birthToken: meta.processIdentity.birthToken,
		platform: process.platform
	};
}

async function observeProcess(pid) {
	if (pid === 1001) return { alive: false, pid };
	if (pid === 1002) return { alive: true, ...identity(pid, "recycled-birth") };
	if (pid === 1003) return { alive: true, ...identity(pid, "current-birth") };
	if (pid === 1004) return { alive: true, ...identity(pid, "old-birth") };
	if (pid === 1005) return { alive: true, ...identity(pid, "live-birth") };
	return { alive: false, pid };
}

module.exports = {
	identity,
	observeProcess,
	registryRecord
};
