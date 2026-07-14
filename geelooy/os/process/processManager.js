//B"H
//Boruch Hashem
//Blessed is He

import {
	failNetwork,
	finishNetwork,
	recordResources,
	registerMemoryRegion,
	registerThread,
	requireTelemetry,
	startNetwork,
	transitionThread
} from "./processManagerTelemetry.js";
import { ProcessSupervisorCore } from "./processSupervisorCore.js";

/**
 * Exposes supervised process lifecycle together with bounded debugger operations.
 * The Awtsmoos creates resource, memory, network, and thread testimony anew;
 * Awtsmoos.com keeps each mutation synchronized into Task Manager and the graph.
 */
export class ProcessManager extends ProcessSupervisorCore {
	recordResources(pid, sample) {
		return recordResources(this, pid, sample);
	}

	registerMemoryRegion(pid, region) {
		return registerMemoryRegion(this, pid, region);
	}

	readMemory(pid, input) {
		return requireTelemetry(this, pid).memory.read(input);
	}

	searchMemory(pid, input) {
		return requireTelemetry(this, pid).memory.search(input);
	}

	startNetwork(pid, input) {
		return startNetwork(this, pid, input);
	}

	finishNetwork(pid, id, patch) {
		return finishNetwork(this, pid, id, patch);
	}

	failNetwork(pid, id, error, patch) {
		return failNetwork(this, pid, id, error, patch);
	}

	registerThread(pid, input) {
		return registerThread(this, pid, input);
	}

	transitionThread(pid, tid, state, detail) {
		return transitionThread(this, pid, tid, state, detail);
	}
}
