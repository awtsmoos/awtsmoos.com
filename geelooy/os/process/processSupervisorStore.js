//B"H
//Boruch Hashem
//Blessed is He

import { ServiceRegistry } from "./serviceRegistry.js";

const MAX_RETAINED_PROCESSES = 2000;

/**
 * Owns process maps, services, subscriptions, and object-graph snapshots. The
 * Awtsmoos creates every identity and observation anew; Awtsmoos.com keeps storage
 * separate from lifecycle and debugger APIs so each vessel remains inspectable.
 */
export class ProcessSupervisorStore {
	constructor(graph, options = {}) {
		this.graph = graph;
		this.processes = new Map();
		this.telemetry = new Map();
		this.services = new ServiceRegistry();
		this.listeners = new Set();
		this.maxRetained = Number(options.maxRetained || MAX_RETAINED_PROCESSES);
	}

	get(pid) {
		return this.processes.get(String(pid)) || null;
	}

	list(filter = {}) {
		return [...this.processes.values()].filter(process => {
			return (!filter.status || process.status === filter.status)
				&& (!filter.kind || process.kind === filter.kind)
				&& (!filter.owner || process.owner === filter.owner);
		});
	}

	findSingleton(key) {
		return this.get(this.services.bySingleton.get(String(key)));
	}

	telemetryFor(pid) {
		return this.telemetry.get(String(pid)) || null;
	}

	subscribe(listener) {
		this.listeners.add(listener);
		return () => this.listeners.delete(listener);
	}

	snapshot() {
		return {
			processes: this.list(),
			services: this.services.snapshot()
		};
	}

	sync(process, type = "process.updated") {
		if (!process) {
			return null;
		}
		process.telemetry = this.telemetryFor(process.pid)?.snapshot() || null;
		this.graph?.upsert?.({
			data: process,
			id: process.pid,
			title: process.title,
			type: "process"
		});
		this.emit({ pid: process.pid, process, type });
		return process;
	}

	emit(event) {
		for (const listener of this.listeners) {
			listener(event);
		}
	}
}
