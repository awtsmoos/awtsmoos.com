// B"H

import { processRecord, touchProcess } from "./process.js";
import { ServiceRegistry } from "./serviceRegistry.js";

const MAX_RETAINED_PROCESSES = 2000;

/**
 * B"H — The manager is a supervised city registry. Windows and startup servers
 * share one lifecycle, but ports and singleton names prevent two vessels from
 * occupying the same address while hundreds of unrelated processes stay free.
 */
export class ProcessManager {
	constructor(graph, options = {}) {
		this.graph = graph;
		this.processes = new Map();
		this.services = new ServiceRegistry();
		this.maxRetained = Number(options.maxRetained || MAX_RETAINED_PROCESSES);
	}

	spawn(input = {}) {
		const existing = input.singletonKey ? this.findSingleton(input.singletonKey) : null;
		if (existing?.status === "running") return existing;
		const process = processRecord(input);
		this.services.claim(process);
		this.processes.set(process.pid, process);
		this.sync(process);
		this.prune();
		return process;
	}

	startService(input = {}) {
		return this.spawn({ ...input, kind: "service", restartPolicy: input.restartPolicy || "on-failure" });
	}

	get(pid) {
		return this.processes.get(String(pid)) || null;
	}

	list(filter = {}) {
		return [...this.processes.values()].filter(process =>
			(!filter.status || process.status === filter.status) &&
			(!filter.kind || process.kind === filter.kind) &&
			(!filter.owner || process.owner === filter.owner)
		);
	}

	stop(pid, reason = "requested", exitCode = 0) {
		const process = this.get(pid);
		if (!process || process.status === "stopped") return process;
		this.services.release(process);
		touchProcess(process, {
			status: "stopped",
			health: exitCode === 0 ? "stopped" : "failed",
			stoppedAt: new Date().toISOString(),
			exitCode,
			stopReason: reason
		});
		this.sync(process);
		return process;
	}

	heartbeat(pid, health = "healthy", detail = null) {
		const process = this.get(pid);
		if (!process) return null;
		return this.sync(touchProcess(process, { health, healthDetail: detail, lastHeartbeatAt: new Date().toISOString() }));
	}

	registerPort(pid, port) {
		const process = this.get(pid);
		if (!process) throw new Error(`process_not_found:${pid}`);
		const key = this.services.claimPort(process.pid, port);
		if (!process.ports.includes(key)) process.ports.push(key);
		return this.sync(touchProcess(process));
	}

	restart(pid) {
		const process = this.get(pid);
		if (!process) return null;
		if (process.restartPolicy === "never" || process.restartCount >= process.maxRestarts) return process;
		this.services.claim(process);
		return this.sync(touchProcess(process, {
			status: "running",
			health: "starting",
			restartCount: process.restartCount + 1,
			startedAt: new Date().toISOString(),
			stoppedAt: null,
			exitCode: null,
			stopReason: null
		}));
	}

	remove(pid) {
		const process = this.get(pid);
		if (!process) return false;
		this.services.release(process);
		return this.processes.delete(process.pid);
	}

	findSingleton(key) {
		return this.get(this.services.bySingleton.get(String(key)));
	}

	snapshot() {
		return { processes: this.list(), services: this.services.snapshot() };
	}

	sync(process) {
		this.graph?.upsert?.({ id: process.pid, type: "process", title: process.title, data: process });
		return process;
	}

	prune() {
		const stopped = this.list({ status: "stopped" });
		while (this.processes.size > this.maxRetained && stopped.length) this.remove(stopped.shift().pid);
	}
}
