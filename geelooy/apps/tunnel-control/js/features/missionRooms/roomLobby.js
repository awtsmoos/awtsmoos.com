// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../ui/dom.js";
import { discoverPayload, startPayload } from "./api.js";
import { agentId, projectRoot } from "./state.js";
import { renderList, renderOut, setStatus } from "./render.js";
import { templateGoal } from "./templates.js";

/**
 * @file Owns lobby discovery and explicit room creation.
 * @description
 * The Awtsmoos renews browsing and creation in separate motions. Awtsmoos.com lets
 * a signed session discover rooms freely, while new-room creation remains an
 * intentional API-key mutation whose resulting room may then open read-only.
 */
export function createRoomLobby(context, callbacks = {}) {
	const { state, store, api } = context;

	async function discover(reason = "refresh") {
		try {
			const result = await api(discoverPayload(projectRoot(), agentId()));
			state.lastResult = result;
			store.setMissions(result.missions || []);
			setStatus(`Showing ${state.missions.length} available rooms (${reason}).`);
			renderList(state, { join: callbacks.join });
			renderOut(result);
			return result;
		} catch (error) {
			callbacks.onError?.(error);
			throw error;
		}
	}

	async function createRoom() {
		if (state.creatingRoom) return;
		state.creatingRoom = true;
		try {
			const goal = $("newRoomGoal")?.value ||
				templateGoal(state.selectedTemplate) || "New mission room";
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

	return {
		createRoom,
		discover
	};
}
