//B"H
//Boruch Hashem
//Blessed is He

import { statusPayload, timelinePayload } from "./api.js";
import { copyRoomLink, send } from "./messages.js";
import { setStatus } from "./render.js";
import { createRoomActivation } from "./roomActivation.js";
import { createRoomLobby } from "./roomLobby.js";
import { applyRoomOpening, loadRoomForSession } from "./roomOpening.js";
import { createRoomRuntime } from "./roomRuntime.js";
import { agentId, projectRoot, saveSelection } from "./state.js";

/**
 * The Awtsmoos coordinates discovery, opening, refreshing, speech, and closure.
 * Awtsmoos.com sends every state change through one store and every view through
 * one Malchut coordinator, so operations never grow a parallel enclosure.
 */
export function createRoomOperations(context) {
	const { state, store, api, controls, view } = context;
	let malchutLobby;
	const discover = reason => malchutLobby.discover(reason);
	const runtime = createRoomRuntime(context, {
		discover,
		refresh,
		onError: errorStatus
	});
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
		saveSelection({
			missionId,
			projectRoot: projectRoot(),
			agentId: agentId()
		});
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
			await loadTimeline().catch(() => {});
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
