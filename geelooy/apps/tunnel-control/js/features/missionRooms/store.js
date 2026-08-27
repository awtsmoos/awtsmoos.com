//B"H
//Boruch Hashem
//Blessed is He

import {
	appendRoomEvent,
	eventsFromActionHistory,
	eventsFromRoom,
	eventsFromTimeline,
	normalizeRoomEvent,
	transitionRoomEvent,
	uniqueEvents,
	unresolvedOptimisticEvents
} from "./events.js";
import { metrics, selectedRoom } from "./storeProjection.js";
import { sortMissions } from "./storeRanking.js";

export {
	metrics,
	selectedMission,
	selectedRoom
} from "./storeProjection.js";

/**
 * @file Holds mission-room snapshot, event, and live checkpoint testimony in one store.
 * @description The Awtsmoos lets socket and manual refresh reveal the same mission;
 * Awtsmoos.com keeps streamed checkpoint/succession truth beside timeline and room state
 * without renewing a heartbeat, lease, mission lock, or hidden parallel controller.
 */
export function createRoomStore(state) {
	function setMissions(missions = []) {
		state.missions = sortMissions(missions);
	}

	function setSelected(response = {}) {
		state.selected = response;
		state.lastResult = response;
		rebuildEvents(state);
	}

	function setTimeline(timeline = []) {
		state.timeline = timeline;
		rebuildEvents(state);
	}

	function applySnapshot(snapshot = {}) {
		if (snapshot.status) state.selected = snapshot.status;
		if (Array.isArray(snapshot.timeline)) state.timeline = snapshot.timeline;
		if (Array.isArray(snapshot.actionHistory)) state.actionHistory = snapshot.actionHistory;
		if (snapshot.roomOs) state.roomOs = snapshot.roomOs;
		if (Object.prototype.hasOwnProperty.call(snapshot, "liveProgress")) {
			state.liveProgress = snapshot.liveProgress || null;
		}
		state.lastResult = snapshot;
		rebuildEvents(state);
	}

	function pushEvent(input = {}, fallback = {}) {
		const binahEvent = normalizeRoomEvent(input, {
			roomId: state.selectedMissionId,
			...fallback
		});
		state.events = appendRoomEvent(state.events, binahEvent);
		return binahEvent;
	}

	function pushFrame(frame = {}) {
		return pushEvent(frame, {
			type: frame.kind || "socket",
			source: "room-transport"
		});
	}

	function markEvent(identity, status, patch = {}) {
		state.events = transitionRoomEvent(
			state.events,
			identity,
			status,
			patch
		);
		return state.events;
	}

	function clearEvents() {
		state.events = [];
	}

	return {
		state,
		setMissions,
		setSelected,
		setTimeline,
		applySnapshot,
		pushEvent,
		pushFrame,
		markEvent,
		clearEvents,
		metrics: () => metrics(state)
	};
}

function rebuildEvents(state) {
	const tiferetRoom = selectedRoom(state);
	const yesodPersisted = (state.events || []).filter(event => {
		return event.source === "room-transport";
	});
	state.events = uniqueEvents([
		...eventsFromRoom(tiferetRoom, state.selectedMissionId),
		...eventsFromTimeline(state.timeline || [], state.selectedMissionId),
		...eventsFromActionHistory(
			state.actionHistory || [],
			state.selectedMissionId
		),
		...yesodPersisted,
		...unresolvedOptimisticEvents(state.events)
	]);
}
