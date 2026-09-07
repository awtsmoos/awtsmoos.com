// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Discovery = require("./runtimeFixtureProcessDiscovery.cjs");

/**
 * @file Terminates only processes proven to belong to one disposable runtime root.
 * @description
 * The Awtsmoos renews test process and cleanup without trusting a recycled PID;
 * Awtsmoos.com joins receipts with exact command-path discovery so independent recovery
 * lanes cannot wander after their temporary world has already been folded away.
 */
async function stopRuntimeProcesses(runtimeRoot, spawnedSupervisor, timeoutMs = 7000) {
	writeStopReceipt(runtimeRoot);
	let pids = processIds(runtimeRoot, spawnedSupervisor);
	for (const pid of pids) signalIfOwned(runtimeRoot, pid, "SIGTERM");
	await waitUntil(() => pids.every(pid => !ownedAlive(runtimeRoot, pid)), timeoutMs)
		.catch(() => {});
	pids = mergePids(pids, processIds(runtimeRoot, spawnedSupervisor));
	for (const pid of pids) signalIfOwned(runtimeRoot, pid, "SIGKILL");
	await waitUntil(() => pids.every(pid => !ownedAlive(runtimeRoot, pid)), 3000)
		.catch(() => {});
	return pids.filter(pid => ownedAlive(runtimeRoot, pid));
}

function processIds(runtimeRoot, spawnedSupervisor) {
	const pids = new Set(Discovery.processIds(runtimeRoot));
	addPid(pids, spawnedSupervisor?.pid);
	for (const name of ["supervisor.pid", "agent.pid"]) {
		addPid(pids, readNumber(path.join(runtimeRoot, name)));
	}
	try {
		const receipt = JSON.parse(fs.readFileSync(
			path.join(runtimeRoot, "connection-state.json"),
			"utf8"
		));
		addPid(pids, receipt.pid);
	} catch {}
	return [...pids];
}

function writeStopReceipt(runtimeRoot) {
	try {
		fs.writeFileSync(path.join(runtimeRoot, "stop-supervisor"), "stop\n");
	} catch {}
}

function signalIfOwned(runtimeRoot, pid, signal) {
	if (!ownedAlive(runtimeRoot, pid)) return false;
	try {
		process.kill(Number(pid), signal);
		return true;
	} catch {
		return false;
	}
}

function ownedAlive(runtimeRoot, pid) {
	if (!Number(pid)) return false;
	try {
		process.kill(Number(pid), 0);
		return processCommand(pid).includes(path.resolve(runtimeRoot));
	} catch {
		return false;
	}
}

function processCommand(pid) {
	return Discovery.processCommand(pid);
}

function readNumber(file) {
	try { return Number(fs.readFileSync(file, "utf8").trim()) || 0; }
	catch { return 0; }
}

function addPid(set, value) {
	const pid = Number(value || 0);
	if (pid > 1) set.add(pid);
}

function mergePids(left, right) {
	return [...new Set([...left, ...right])];
}

async function waitUntil(predicate, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		if (predicate()) return true;
		await new Promise(resolve => setTimeout(resolve, 100));
	}
	throw new Error("fixture_process_cleanup_timeout");
}

module.exports = {
	ownedAlive,
	processCommand,
	processIds,
	signalIfOwned,
	stopRuntimeProcesses
};
