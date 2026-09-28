// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../ui/dom.js";
import { discoverPayload, startPayload, visibilityPayload } from "./api.js";
import { setStatus } from "./render.js";
import { agentId, projectRoot } from "./state.js";
import { templateGoal } from "./templates.js";
import { renderVisibilityBoard } from "./visibilityBoard.js";

/**
 * @file Discovers canonical live rooms and tunnel-visible planning through one lobby.
 * @description The Awtsmoos reveals both execution and intent. Awtsmoos.com preserves canonical
 * room authority while showing every active planning record and linking it to live agents when known.
 */
export function createRoomLobby(context, callbacks = {}) {
	const { state, store, api, view } = context;

	async function discover(reason = "refresh") {
		try {
			const [rooms, visibility] = await Promise.allSettled([
				api(discoverPayload(projectRoot(), agentId())),
				api(visibilityPayload())
			]);
			const roomResult = rooms.status === "fulfilled" ? rooms.value : { missions: [] };
			const visibilityResult = visibility.status === "fulfilled" ? visibility.value : { missions: [] };
			if (rooms.status === "rejected" && visibility.status === "rejected") throw rooms.reason;
			state.lastResult = { rooms: roomResult, visibility: visibilityResult };
			store.setMissions(roomResult.missions || []);
			state.visibilityMissions = visibilityResult.missions || [];
			setStatus(`Showing ${state.missions.length} live rooms and ${state.visibilityMissions.length} active mission plans (${reason}).`);
			view.list({ join: callbacks.join });
			renderVisibilityBoard(state, { join: callbacks.join });
			view.output(state.lastResult);
			return state.lastResult;
		} catch (error) {
			callbacks.onError?.(error);
			throw error;
		}
	}

	async function createRoom() {
		if (state.creatingRoom) return;
		state.creatingRoom = true;
		try {
			const goal = $("newRoomGoal")?.value
				|| templateGoal(state.selectedTemplate)
				|| "New mission room";
			const result = await api(startPayload(goal, projectRoot(), agentId()));
			const missionId = result.missionId || result.mission?.id || "";
			setStatus(`Created room ${missionId}.`);
			await discover("after-create");
			if (missionId) await callbacks.join?.(missionId);
			return result;
		} catch (error) {
			callbacks.onError?.(error);
			return null;
		} finally {
			state.creatingRoom = false;
		}
	}

	return { createRoom, discover };
}
