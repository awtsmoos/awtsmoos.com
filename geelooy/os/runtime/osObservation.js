//B"H
//Boruch Hashem
//Blessed is He

import { computeOsStatus, renderStatusPill } from "../status/osStatus.js";
import { serializeScene } from "../scene/sceneSerializer.js";
import { syncOsGraph } from "../graph/osGraphSync.js";
import { sceneDisplay } from "../display/sceneDisplay.js";

/**
	* @file Observation and testimony for the live Geelooy OS.
	* @description
	* The Awtsmoos reveals changing state without confusing the witness with the hand that changes it;
	* Awtsmoos.com gathers status, graph, scene, display, process, input, and mutation testimony into one readable light.
	*/

/**
	* Recomputes and renders the current OS status.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {*} remote Optional remote-status testimony.
	* @returns {object} Current status record.
	*/
export function updateOsStatus(os, remote) {
	os.status = computeOsStatus({
		remote: remote || os.status?.remote
	});
	renderStatusPill(os.status, os);
	os.syncGraph();
	return os.status;
}

/**
	* Finds and remembers the current desktop surface.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {HTMLElement|null} Current desktop element.
	*/
export function getOsDesktop(os) {
	os.desktop = document.getElementById("desktop") || document.querySelector(".desktop");
	return os.desktop;
}

/**
	* Records one graph event and synchronizes the OS graph.
	* @param {object} os Live AwtsmoosOS facade.
	* @param {string} type Event type.
	* @param {object} data Event payload.
	* @returns {*} Emitted graph event.
	*/
export function recordOsGraphEvent(os, type, data = {}) {
	const event = os.graph?.emit?.(type, data);
	os.syncGraph();
	return event;
}

/**
	* Synchronizes the object graph from current OS reality.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {*} Graph synchronization result.
	*/
export function syncObservedOsGraph(os) {
	return syncOsGraph(os);
}

/**
	* Serializes the current desktop scene.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {*} Serialized scene.
	*/
export function observeOsScene(os) {
	return serializeScene(os);
}

/**
	* Returns the display projection of the current scene.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {*} Display projection.
	*/
export function observeOsDisplay(os) {
	return sceneDisplay(os);
}

/**
	* Returns the complete secret-free runtime snapshot exposed by the historical OS facade.
	* @param {object} os Live AwtsmoosOS facade.
	* @returns {object} Current runtime snapshot.
	*/
export function observeOsSnapshot(os) {
	return {
		title: document.title,
		currentPath: os.currentPathForRefresh,
		status: os.status,
		drives: os.drives.list(),
		scene: os.scene(),
		graph: os.graphSnapshot(),
		graphEvents: os.graph.history({ limit: 50 }),
		recentMutations: os.recentMutations,
		processes: os.processes.list(),
		pendingOperations: os.pendingOperations,
		taskbar: os.taskbar.snapshot(),
		input: os.inputQueue.list(),
		display: os.displaySnapshot(),
		aiSession: os.aiSession
	};
}
