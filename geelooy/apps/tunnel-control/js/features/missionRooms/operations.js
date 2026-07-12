// B"H

import { $ } from "../../ui/dom.js";
import { startPayload, discoverPayload, joinPayload, statusPayload, timelinePayload } from "./api.js";
import { agentId, projectRoot, saveSelection } from "./state.js";
import { renderActivity, renderAll, renderList, renderOut, renderRoom, setStatus } from "./render.js";
import { send, copyRoomLink } from "./messages.js";
import { templateGoal } from "./templates.js";
import { createRoomActivation } from "./roomActivation.js";
import { createRoomRuntime } from "./roomRuntime.js";

export function createRoomOperations(context) {
	const { state, store, api, controls } = context;
	const runtime = createRoomRuntime(context, { discover, refresh, onError: errorStatus });
	const activation = createRoomActivation(state, runtime, { discover, join });
	async function createRoom() {
		if (state.creatingRoom) return;
		state.creatingRoom = true;
		try {
			const goal = $("newRoomGoal")?.value || templateGoal(state.selectedTemplate) || "New mission room";
			const got = await api(startPayload(goal, projectRoot(), agentId()));
			const missionId = got.missionId || got.mission?.id || "";
			setStatus(`Created room ${missionId}.`);
			await discover("after-create");
			if (missionId) await join(missionId);
		} catch (error) {
			errorStatus(error);
		} finally {
			state.creatingRoom = false;
		}
	}
	async function discover(reason = "refresh") {
		const got = await api(discoverPayload(projectRoot(), agentId()));
		state.lastResult = got;
		store.setMissions(got.missions || []);
		setStatus(`Showing ${state.missions.length} available rooms (${reason}).`);
		renderList(state, { join });
		renderOut(got);
	}
	async function join(missionId, quiet = false) {
		if (!missionId) return;
		runtime.closeLiveResources();
		resetSelection(state, missionId);
		state.socketMode = "connecting";
		store.setSelected(await api(joinPayload(missionId, {
			agentId: agentId(),
			role: "human-room",
			capabilities: "comment,steer,approve,block,turn-control",
			projectRoot: projectRoot()
		})));
		saveSelection({ missionId, projectRoot: projectRoot(), agentId: agentId() });
		await loadTimeline().catch(() => {});
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
		const got = await api(timelinePayload(state.selectedMissionId));
		store.setTimeline(got.timeline || []);
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
		createRoom,
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
