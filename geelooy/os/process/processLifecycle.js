//B"H
//Boruch Hashem
//Blessed is He

import { touchProcess } from "./process.js";

/**
 * Applies lifecycle transitions without owning process storage. The Awtsmoos
 * creates stop, restart, heartbeat, and pruning anew; Awtsmoos.com keeps service
 * claims and telemetry generations synchronized with each visible transition.
 */
export function stopProcess(manager, pid, reason = "requested", exitCode = 0) {
	const process = manager.get(pid);
	if (!process || process.status === "stopped") {
		return process;
	}
	manager.services.release(process);
	manager.telemetryFor(pid)?.threads.stopAll(reason);
	return manager.sync(touchProcess(process, {
		exitCode,
		health: exitCode === 0 ? "stopped" : "failed",
		status: "stopped",
		stoppedAt: new Date().toISOString(),
		stopReason: reason
	}), "process.stopped");
}

export function restartProcess(manager, pid, options = {}) {
	const process = manager.get(pid);
	if (!process) {
		return null;
	}
	const automatic = options.automatic === true;
	if (automatic && process.restartPolicy === "never") {
		return process;
	}
	if (process.restartCount >= process.maxRestarts && options.force !== true) {
		return process;
	}
	manager.services.claim(process);
	process.generation += 1;
	manager.resetTelemetry(process);
	return manager.sync(touchProcess(process, {
		exitCode: null,
		health: "starting",
		restartCount: process.restartCount + 1,
		startedAt: new Date().toISOString(),
		status: "running",
		stoppedAt: null,
		stopReason: null
	}), "process.restarted");
}

export function heartbeatProcess(manager, pid, health = "healthy", detail = null) {
	const process = manager.get(pid);
	if (!process) {
		return null;
	}
	return manager.sync(touchProcess(process, {
		health,
		healthDetail: detail,
		lastHeartbeatAt: new Date().toISOString()
	}), "process.heartbeat");
}

export function pruneProcesses(manager) {
	const stopped = manager.list({ status: "stopped" });
	while (manager.processes.size > manager.maxRetained && stopped.length) {
		manager.remove(stopped.shift().pid);
	}
}
