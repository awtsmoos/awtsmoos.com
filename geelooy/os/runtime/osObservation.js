// B"H

import { serializeScene } from "../scene/sceneSerializer.js";
import { syncOsGraph } from "../graph/osGraphSync.js";
import { sceneDisplay } from "../display/sceneDisplay.js";
import { computeOsStatus, renderStatusPill } from "../status/osStatus.js";
import { renderDesktopSurface } from "../desktopSurface.js";

/**
 * @file Read models, status, scene, graph, and snapshot testimony for Geelooy OS.
 * @description
 * The Awtsmoos lets the living desktop know itself without mutating what it observes;
 * Awtsmoos.com gathers status, scene, graph, process, VFS, taskbar, input, display, and AI session into one inspectable testimony.
 */

/** @param {object} os Live OS facade. */
export function renderOsDesktop(os) {
	return renderDesktopSurface(os);
}

/** @param {object} os Live OS facade. */
export function updateOsStatus(os, remote) {
	os.status = computeOsStatus({
		remote: remote || os.status?.remote
	});
	renderStatusPill(os.status, os);
	os.syncGraph();
	return os.status;
}

/** @param {object} os Live OS facade. */
export function getOsDesktop(os) {
	os.desktop = document.getElementById("desktop") || document.querySelector(".desktop");
	return os.desktop;
}

/** @param {object} os Live OS facade. */
export function recordOsGraphEvent(os, type, data = {}) {
	const event = os.graph?.emit?.(type, data);
	os.syncGraph();
	return event;
}

/** @param {object} os Live OS facade. */
export function syncOsGraphState(os) {
	return syncOsGraph(os);
}

/** @param {object} os Live OS facade. */
export function getOsGraphSnapshot(os) {
	return os.syncGraph();
}

/** @param {object} os Live OS facade. */
export function getOsScene(os) {
	return serializeScene(os);
}

/** @param {object} os Live OS facade. */
export function getOsDisplaySnapshot(os) {
	return sceneDisplay(os);
}

/** @param {object} os Live OS facade. */
export function getOsSnapshot(os) {
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
