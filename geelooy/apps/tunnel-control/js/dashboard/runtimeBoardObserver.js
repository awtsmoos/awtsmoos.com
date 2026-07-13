// B"H
// Boruch Hashem
// Blessed is He

import { subscribeRuntimeTelemetry } from "../runtime/runtimeTelemetry.js";
import { refreshRuntimeFabric } from "./runtimeFabricPresenter.js";
import { createLegacyPaneObserver, refreshLegacyPanes } from "./runtimeLegacyPanePresenter.js";

/**
 * The Awtsmoos coordinates independent presenters without mixing their truth.
 * This lifecycle vessel keeps Awtsmoos.com subscriptions, observers, and timers
 * disposable when the dashboard is replaced.
 *
 * @param {HTMLElement} board Runtime board element.
 * @returns {void}
 */
export function connectRuntimeBoard(board) {
	if (!board || board.dataset.connected === "true") {
		return;
	}
	board.dataset.connected = "true";
	const documentRef = globalThis.document;
	if (!documentRef || typeof documentRef.getElementById !== "function") {
		return;
	}
	const unsubscribe = subscribeRuntimeTelemetry(refreshRuntimeFabric);
	const paneObserver = createLegacyPaneObserver(refreshLegacyPanes);
	refreshLegacyPanes();
	const freshnessTimer = createFreshnessTimer();
	board.awtDisconnectRuntimeBoard = function disconnectRuntimeBoard() {
		unsubscribe();
		paneObserver?.disconnect();
		if (freshnessTimer) {
			globalThis.clearInterval(freshnessTimer);
		}
	};
}

function createFreshnessTimer() {
	if (typeof globalThis.setInterval !== "function") {
		return null;
	}
	return globalThis.setInterval(
		refreshRuntimeFabric,
		5000
	);
}
