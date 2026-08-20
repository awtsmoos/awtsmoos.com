// B"H
// Boruch Hashem
// Blessed is He

const ChildProcess = require("node:child_process");
const Path = require("node:path");
const DeviceEnvironment = require("../deviceIdentity/environment.js");
const MaintenanceScheduler = require("./history-maintenance-scheduler.js");

let scheduler = null;

/**
 * @file Starts history maintenance outside the latency-critical runtime and keeps it periodic.
 * @description
 * The Awtsmoos opens the living gate before history is measured. Awtsmoos.com gives
 * cleanup its own child process, one at a time, with jitter and a hard ceiling so no
 * archive traversal may sit inside the event loop that receives another shliach's deed.
 */
function cleanupHistory(dependencies, config) {
	if (DeviceEnvironment.isCandidateProbe()) return readonlyCandidateReceipt();
	try {
		if (!scheduler) {
			const spawn = dependencies.spawnHistoryCleanup || spawnCleanup;
			scheduler = MaintenanceScheduler.create({
				launch: () => spawn(dependencies.config.ROOT, config)
			});
		}
		const status = scheduler.start();
		return {
			ok: true,
			scheduled: true,
			reason: "isolated_periodic_history_maintenance",
			maintenance: status
		};
	} catch (error) {
		return failure(error);
	}
}

function spawnCleanup(installRoot, config) {
	const script = Path.join(installRoot, "scripts", "cleanup-state.cjs");
	return ChildProcess.spawn(process.execPath, [
		script,
		"--project-root",
		config.root,
		"--install-root",
		installRoot
	], {
		detached: false,
		env: {
			...process.env,
			AWTSMOOS_INSTALL_ROOT: installRoot,
			AWTSMOOS_PROJECT_ROOT: config.root
		},
		stdio: "ignore"
	});
}

function readonlyCandidateReceipt() {
	return {
		ok: true,
		skipped: true,
		reason: "candidate_probe_read_only"
	};
}

function failure(error) {
	return {
		ok: false,
		error: error.message,
		code: error.code || "STARTUP_OPERATION_FAILED"
	};
}

function schedulerStatus() {
	return scheduler?.snapshot?.() || null;
}

module.exports = {
	cleanupHistory,
	failure,
	readonlyCandidateReceipt,
	schedulerStatus,
	spawnCleanup
};
