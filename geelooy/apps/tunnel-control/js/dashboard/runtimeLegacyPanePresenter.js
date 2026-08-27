// B"H
// Boruch Hashem
// Blessed is He

import { queryDeckNodes, readDeckText, setDeckCardState, setDeckText } from "./runtimeBoardDom.js";

/**
 * The Awtsmoos preserves legacy pane observations behind an explicit boundary.
 * These values remain compatibility signals until Awtsmoos.com exposes direct
 * room and live-action stores to the command deck.
 */

/** @returns {void} Refreshes both compatibility-backed cards. */
export function refreshLegacyPanes() {
	refreshRoomCompatibility();
	refreshLiveCompatibility();
}

/**
 * Observes only the rendered room and live panes.
 *
 * @param {Function} refresh Refresh callback.
 * @returns {MutationObserver|null} Observer when supported.
 */
export function createLegacyPaneObserver(refresh) {
	const Observer = globalThis.MutationObserver;
	const documentRef = globalThis.document;
	if (typeof Observer !== "function" || !documentRef) {
		return null;
	}
	let queued = false;
	const schedule = function scheduleLegacyRefresh() {
		if (queued) {
			return;
		}
		queued = true;
		const run = function runLegacyRefresh() {
			queued = false;
			refresh();
		};
		if (typeof globalThis.requestAnimationFrame === "function") {
			globalThis.requestAnimationFrame(run);
			return;
		}
		globalThis.setTimeout(run, 0);
	};
	const observer = new Observer(schedule);
	for (const selector of [
		"[data-pane='missionRooms']",
		"[data-pane='live']"
	]) {
		const root = documentRef.querySelector?.(selector);
		if (root) {
			observer.observe(root, {
				subtree: true,
				childList: true,
				characterData: true,
				attributes: true
			});
		}
	}
	return observer;
}

function refreshRoomCompatibility() {
	const cards = queryDeckNodes(".awt-room-card");
	const needingHuman = cards.filter(function needsHuman(card) {
		return card.classList.contains("is-needs-human");
	}).length;
	const agentCount = queryDeckNodes("#roomMembers .awt-room-member").length;
	setDeckText("awtDeckRoomCount", String(cards.length));
	setDeckText("awtDeckRoomNeeds", String(needingHuman));
	setDeckText("awtDeckRoomAgents", agentCount ? String(agentCount) : "—");
	setDeckText("awtDeckRoomStream", readDeckText("roomSocketState", "Lobby"));
	setDeckText("awtDeckSelectedRoom", readDeckText("roomHeader", "No room selected yet."));
	setDeckCardState("awtDeckRoomsCard", resolveRoomState(cards.length, needingHuman));
}

function refreshLiveCompatibility() {
	const mode = readDeckText("liveKpi_mode", "idle");
	const status = readDeckText("liveSocketState", "Waiting for live pane");
	setDeckText("awtDeckLiveMode", mode);
	setDeckText("awtDeckLiveTotal", readDeckText("liveKpi_total", "—"));
	setDeckText("awtDeckLiveFailed", readDeckText("liveKpi_failed", "—"));
	setDeckText("awtDeckLiveStatus", status);
	setDeckCardState("awtDeckLiveCard", resolveLiveState(mode, status));
}

function resolveRoomState(roomCount, needingHuman) {
	if (needingHuman > 0) {
		return "is-warning";
	}
	return roomCount > 0 ? "is-live" : "is-idle";
}

function resolveLiveState(mode, status) {
	if (/error|failed/i.test(status)) {
		return "is-warning";
	}
	return /websocket|eventsource|polling/i.test(mode) ? "is-live" : "is-idle";
}
