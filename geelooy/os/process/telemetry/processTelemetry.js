//B"H
//Boruch Hashem
//Blessed is He

import { MemoryRegions } from "./memoryRegions.js";
import { NetworkJournal } from "./networkJournal.js";
import { ResourceLedger } from "./resourceLedger.js";
import { ThreadLedger } from "./threadLedger.js";

/**
 * Joins all inspectable testimony for one process. The Awtsmoos creates memory,
 * thread, network, and resource ledgers anew; Awtsmoos.com keeps their mutable
 * stores private while snapshots remain safe for the object graph and Task Manager.
 */
export class ProcessTelemetry {
	constructor(options = {}) {
		this.memory = new MemoryRegions(options.memory);
		this.network = new NetworkJournal(options.network);
		this.resources = new ResourceLedger(options.resources);
		this.threads = new ThreadLedger(options.threads);
		this.generation = Number(options.generation || 1);
	}

	reset(generation) {
		return new ProcessTelemetry({ generation });
	}

	snapshot() {
		return Object.freeze({
			generation: this.generation,
			memory: this.memory.snapshot(),
			network: this.network.snapshot(),
			resources: this.resources.snapshot(),
			threads: this.threads.snapshot()
		});
	}
}
