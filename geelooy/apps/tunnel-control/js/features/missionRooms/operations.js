// B"H
// Boruch Hashem
// Blessed is He

import { statusPayload, timelinePayload } from "./api.js";
import { agentId, projectRoot, saveSelection } from "./state.js";
import { renderActivity, renderAll, renderOut, renderRoom, setStatus } from "./render.js";
import { send, copyRoomLink } from "./messages.js";
import { createRoomActivation } from "./roomActivation.js";
import { createRoomLobby } from "./roomLobby.js";
import { createRoomRuntime } from "./roomRuntime.js";
import { applyRoomOpening, loadRoomForSession } from "./roomOpening.js";

/**
 * @file Coordinates Mission Rooms without turning ordinary viewing into mutation.
 * @description
 * The Awtsmoos renews lobby, room, stream, and authority in their proper vessels.
 * Awtsmoos.com opens rooms through status and timeline reads; creation, messages,
 * steering, approvals, and agent participation remain scoped key operations.
 */
export function createRoomOperations(context) {
	const { state, store, api, controls } = context;
	let lobby;
	const discover = reason => lobby.discover(reason);
	const runtime = createRoomRuntime(context, { discover, refresh, onError: errorStatus });
	const activation = createRoomActivation(state, runtime, { discover, join });
	lobby = createRoomLobby(context, { join, onError: errorStatus });

	async function join(missionId, quiet = false) {
		if (!missionId) return;
		runtime.closeLiveResources();
		resetSelection(state, missionId);
		state.socketMode = "connecting";
		const opening = await loadRoomForSession(api, missionId, {
			projectRoot: projectRoot(),
			agentId: agentId()
		});
		applyRoomOpening(state, store, opening);
		saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
		if (!quiet) setStatus(`Opened room ${missionId}.`);
		renderAll(state, { join });
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
			renderRoom(state);
			renderActivity(state);
			renderOut(state.selected);
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
		resetSelection(state, "");
		state.selected = null;
		renderAll(state, { join });
		controls.render();
		setStatus(`Showing ${state.missions.length} available rooms.`);
	}

	return {
		activate: activation.activate,
		closeRoom,
		copyLink: () => copyRoomLink(state),
		createRoom: lobby.createRoom,
		destroy: runtime.destroy,
		discover,
		join,
		refresh,
		send: allow => send(state, api, allow),
		suspend: activation.suspend,
		visibility: runtime.visibility
	};
}

function resetSelection(state, missionId) {
	state.selectedMissionId = missionId;
	state.timeline = [];
	state.events = [];
	state.selectedEventId = "";
	state.replayEnabled = false;
	state.continuation = null;
	state.resourceStatus = {};
	state.turnError = "";
}

function errorStatus(error) {
	setStatus(error?.message || String(error));
}
