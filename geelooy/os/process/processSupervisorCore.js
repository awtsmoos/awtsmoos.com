//B"H
//Boruch Hashem
//Blessed is He

import { processRecord, touchProcess } from "./process.js";
import {
	heartbeatProcess,
	pruneProcesses,
	restartProcess,
	stopProcess
} from "./processLifecycle.js";
import { ProcessSupervisorStore } from "./processSupervisorStore.js";
import { ProcessTelemetry } from "./telemetry/processTelemetry.js";

/**
 * Adds lifecycle and telemetry-generation behavior to the process store. The
 * Awtsmoos creates spawn, service, restart, port, and removal anew; Awtsmoos.com
 * keeps those transitions separate from debugger mutation APIs.
 */
export class ProcessSupervisorCore extends ProcessSupervisorStore {
	spawn(input = {}) {
		const existing = input.singletonKey
			? this.findSingleton(input.singletonKey)
			: null;
		if (existing?.status === "running") {
			return existing;
		}
		const process = processRecord(input);
		this.services.claim(process);
		this.processes.set(process.pid, process);
		this.resetTelemetry(process);
		this.sync(process, "process.spawned");
		pruneProcesses(this);
		return process;
	}

	startService(input = {}) {
		return this.spawn({
			...input,
			kind: "service",
			restartPolicy: input.restartPolicy || "on-failure"
		});
	}

	stop(pid, reason = "requested", exitCode = 0) {
		return stopProcess(this, pid, reason, exitCode);
	}

	restart(pid, options = {}) {
		return restartProcess(this, pid, options);
	}

	heartbeat(pid, health = "healthy", detail = null) {
		return heartbeatProcess(this, pid, health, detail);
	}

	registerPort(pid, port) {
		const process = this.get(pid);
		if (!process) {
			throw supervisorError("PROCESS_NOT_FOUND", pid);
		}
		const key = this.services.claimPort(process.pid, port);
		if (!process.ports.includes(key)) {
			process.ports.push(key);
		}
		return this.sync(touchProcess(process), "process.port");
	}

	remove(pid) {
		const process = this.get(pid);
		if (!process) {
			return false;
		}
		this.services.release(process);
		this.telemetry.delete(process.pid);
		this.graph?.remove?.(process.pid);
		const removed = this.processes.delete(process.pid);
		this.emit({ pid: process.pid, type: "process.removed" });
		return removed;
	}

	resetTelemetry(process) {
		const telemetry = new ProcessTelemetry({ generation: process.generation });
		telemetry.threads.register({
			name: "Main thread",
			tid: `${process.pid}:main`
		});
		this.telemetry.set(process.pid, telemetry);
		return telemetry;
	}
}

function supervisorError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
