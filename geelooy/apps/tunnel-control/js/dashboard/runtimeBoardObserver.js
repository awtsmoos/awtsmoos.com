// B"H
// Boruch Hashem
// Blessed is He

import { subscribeRuntimeTelemetry } from "../runtime/runtimeTelemetry.js";
import { refreshRuntimeFabric } from "./runtimeFabricPresenter.js";
import { createLegacyPaneObserver, refreshLegacyPanes } from "./runtimeLegacyPanePresenter.js";

/** Coordinates telemetry, compatibility presenters, and disposable timers. */
export function connectRuntimeBoard(board) {
	if (!board || board.dataset.connected === "true") return;
	board.dataset.connected = "true";
	const documentRef = globalThis.document;
	if (!documentRef || typeof documentRef.getElementById !== "function") return;

	const unsubscribe = subscribeRuntimeTelemetry(function presentTelemetry() {
		refreshRuntimeFabric(Date.now());
	});
	const paneObserver = createLegacyPaneObserver(refreshLegacyPanes);
	refreshLegacyPanes();
	const freshnessTimer = createFreshnessTimer();
	board.awtDisconnectRuntimeBoard = function disconnectRuntimeBoard() {
		unsubscribe();
		paneObserver?.disconnect();
		if (freshnessTimer) globalThis.clearInterval(freshnessTimer);
	};
}

function createFreshnessTimer() {
	if (typeof globalThis.setInterval !== "function") return null;
	return globalThis.setInterval(
		function refreshFreshnessLabel() {
			refreshRuntimeFabric(Date.now());
		},
		5000
	);
}
