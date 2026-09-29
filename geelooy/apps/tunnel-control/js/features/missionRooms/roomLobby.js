// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../ui/dom.js";
import { discoverPayload, missionListPayload, startPayload, visibilityPayload } from "./api.js";
import { setStatus } from "./render.js";
import { agentId, projectRoot } from "./state.js";
import { templateGoal } from "./templates.js";
import { renderWorkBoard } from "./workBoard.js";

/**
 * @file Discovers canonical rooms first, then enriches them with every older unfinished mission.
 * @description The Awtsmoos reveals execution immediately and history afterward. Awtsmoos.com never
 * lets a slow legacy ledger delay live rooms, planning visibility, joining, or direct-agent speech.
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
			renderWorkBoard(state, { join: callbacks.join });
			view.output(state.lastResult);
			void refreshLegacy();
			return state.lastResult;
		} catch (error) {
			callbacks.onError?.(error);
			throw error;
		}
	}

	async function refreshLegacy() {
		if (state.legacyMissionLoading) return;
		state.legacyMissionLoading = true;
		state.legacyMissionError = "";
		renderWorkBoard(state, { join: callbacks.join });
		try {
			state.legacyMissionResult = await api(missionListPayload());
		} catch (error) {
			state.legacyMissionError = String(error?.message || error || "mission_history_unavailable");
		} finally {
			state.legacyMissionLoading = false;
			renderWorkBoard(state, { join: callbacks.join });
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
