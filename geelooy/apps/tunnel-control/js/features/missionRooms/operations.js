// B"H
// Boruch Hashem
// Blessed is He

import { liveProgressPayload, statusPayload, timelinePayload } from "./api.js";
import { copyRoomLink, send } from "./messages.js";
import { setStatus } from "./render.js";
import { createRoomActivation } from "./roomActivation.js";
import { createRoomLobby } from "./roomLobby.js";
import { applyRoomOpening, loadRoomForSession } from "./roomOpening.js";
import { createRoomRuntime } from "./roomRuntime.js";
import { agentId, projectRoot, saveSelection } from "./state.js";

/**
 * @file Coordinates the one Mission Rooms discovery/open/refresh/speech lifecycle.
 * @description The Awtsmoos lets checkpoint, timeline, and room status flow through one selected-room refresh;
 * Awtsmoos.com clears stale observation when live progress cannot be witnessed instead of displaying yesterday as now.
 */
export function createRoomOperations(context) {
	const { state, store, api, controls, view } = context;
	let malchutLobby;
	const discover = reason => malchutLobby.discover(reason);
	const runtime = createRoomRuntime(context, { discover, refresh, onError: errorStatus });
	const activation = createRoomActivation(state, runtime, { discover, join });
	malchutLobby = createRoomLobby(context, { join, onError: errorStatus });

	async function join(missionId, quiet = false) {
		if (!missionId) return;
		runtime.closeLiveResources();
		resetSelection(state, store, missionId);
		state.socketMode = "connecting";
		const opening = await loadRoomForSession(api, missionId, {
			projectRoot: projectRoot(),
			agentId: agentId()
		});
		applyRoomOpening(state, store, opening);
		saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
		if (!quiet) setStatus(`Opened room ${missionId}.`);
		view.all({ join });
		controls.render();
		await controls.refresh();
		if (state.paneActive) {
			runtime.openSocket();
			runtime.scheduleRoom();
		}
	}

	async function refresh(quiet = false) {
		if (!state.selectedMissionId || state.busy) return;
		state.busy = true;
		try {
			store.setSelected(await api(statusPayload(state.selectedMissionId)));
			await Promise.all([loadTimeline().catch(() => {}), loadLiveProgress()]);
			if (!quiet) setStatus(`Room refreshed: ${state.selectedMissionId}`);
			view.selected();
		} catch (error) {
			errorStatus(error);
		} finally {
			state.busy = false;
		}
	}

	async function loadTimeline() {
		if (!state.selectedMissionId) return;
		const result = await api(timelinePayload(state.selectedMissionId));
		store.setTimeline(result.timeline || result.events || []);
	}

	async function loadLiveProgress() {
		if (!state.selectedMissionId) return;
		try {
			const result = await api(liveProgressPayload(state.selectedMissionId));
			state.liveProgress = result.liveProgress || null;
		} catch {
			state.liveProgress = null;
		}
	}

	function closeRoom() {
		runtime.closeLiveResources();
		resetSelection(state, store, "");
		state.selected = null;
		view.all({ join });
		controls.render();
		setStatus(`Showing ${state.missions.length} available rooms.`);
	}

	return {
		activate: activation.activate,
		closeRoom,
		copyLink: () => copyRoomLink(state),
		createRoom: malchutLobby.createRoom,
		destroy: runtime.destroy,
		discover,
		join,
		refresh,
		send: allow => send(state, api, allow),
		suspend: activation.suspend,
		visibility: runtime.visibility
	};
}

function resetSelection(state, store, missionId) {
	state.selectedMissionId = missionId;
	state.timeline = [];
	state.liveProgress = null;
	store.clearEvents();
	state.selectedEventId = "";
	state.replayEnabled = false;
	state.continuation = null;
	state.resourceStatus = {};
	state.turnError = "";
}

function errorStatus(error) {
	setStatus(error?.message || String(error));
}
