//B"H
// Boruch Hashem
// Blessed is He

import { serializeScene } from "../scene/sceneSerializer.js";
import { syncOsGraph } from "../graph/osGraphSync.js";
import { sceneDisplay } from "../display/sceneDisplay.js";
import { computeOsStatus, renderStatusPill } from "../status/osStatus.js";
import { renderDesktopSurface } from "../desktopSurface.js";

/**
 * @file Read models, status, scene, graph, and snapshot testimony for Geelooy OS.
 * @description
 * The Awtsmoos lets the living desktop know itself while old and new witnesses name one light;
 * Awtsmoos.com keeps desktop rendering, graph truth, and secret-free observation beneath one compatible crown.
 */

export function renderOsDesktop(os) {
	return renderDesktopSurface(os);
}

export function updateOsStatus(os, remote) {
	os.status = computeOsStatus({
		remote: remote || os.status?.remote
	});
	renderStatusPill(os.status, os);
	os.syncGraph();
	return os.status;
}

export function getOsDesktop(os) {
	os.desktop = document.getElementById("desktop") || document.querySelector(".desktop");
	return os.desktop;
}

export function recordOsGraphEvent(os, type, data = {}) {
	const event = os.graph?.emit?.(type, data);
	os.syncGraph();
	return event;
}

export function syncOsGraphState(os) {
	return syncOsGraph(os);
}

export function getOsGraphSnapshot(os) {
	return os.syncGraph();
}

export function getOsScene(os) {
	return serializeScene(os);
}

export function getOsDisplaySnapshot(os) {
	return sceneDisplay(os);
}

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

export function syncObservedOsGraph(os) {
	return syncOsGraphState(os);
}

export function observeOsScene(os) {
	return getOsScene(os);
}

export function observeOsDisplay(os) {
	return getOsDisplaySnapshot(os);
}

export function observeOsSnapshot(os) {
	return getOsSnapshot(os);
}
