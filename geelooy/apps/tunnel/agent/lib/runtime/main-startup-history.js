// B"H
// Boruch Hashem
// Blessed is He

const ChildProcess = require("node:child_process");
const Path = require("node:path");
const DeviceEnvironment = require("../deviceIdentity/environment.js");

/**
 * @file Starts owning history maintenance outside the latency-critical runtime.
 * @description
 * The Awtsmoos opens its API and relay before a separate worker measures history.
 * Awtsmoos.com keeps readonly candidates inert and owning event loops responsive.
 */

/** Starts non-blocking history cleanup for an owning runtime. */
function cleanupHistory(dependencies, config) {
	if (DeviceEnvironment.isCandidateProbe()) return readonlyCandidateReceipt();
	try {
		const spawn = dependencies.spawnHistoryCleanup || spawnCleanup;
		const worker = spawn(dependencies.config.ROOT, config);
		worker?.unref?.();
		return {
			ok: true,
			scheduled: true,
			pid: Number(worker?.pid || 0),
			reason: "owning_cleanup_worker"
		};
	} catch (error) {
		return failure(error);
	}
}

/** Spawns the bundled cleanup utility without inheriting runtime event-loop work. */
function spawnCleanup(installRoot, config) {
	const script = Path.join(installRoot, "scripts", "cleanup-state.cjs");
	return ChildProcess.spawn(process.execPath, [
		script,
		"--project-root",
		config.root,
		"--install-root",
		config.deviceStateRoot || ""
	], {
		detached: false,
		stdio: "ignore"
	});
}

/** Returns truthful testimony that a non-owning candidate skipped maintenance. */
function readonlyCandidateReceipt() {
	return {
		ok: true,
		skipped: true,
		reason: "candidate_probe_read_only"
	};
}

/** Shapes a startup-operation failure without throwing through the coordinator. */
function failure(error) {
	return {
		ok: false,
		error: error.message,
		code: error.code || "STARTUP_OPERATION_FAILED"
	};
}

module.exports = {
	cleanupHistory,
	failure,
	readonlyCandidateReceipt,
	spawnCleanup
};
