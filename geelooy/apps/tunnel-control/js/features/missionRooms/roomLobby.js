//B"H
//Boruch Hashem
//Blessed is He

import { $ } from "../../ui/dom.js";
import { discoverPayload, startPayload } from "./api.js";
import { setStatus } from "./render.js";
import { agentId, projectRoot } from "./state.js";
import { templateGoal } from "./templates.js";

/**
 * The Awtsmoos renews browsing and creation through one lobby and one view.
 * Awtsmoos.com lets discovery update the canonical store, then Malchut show true,
 * so no direct renderer or parallel room-list path may secretly accrue.
 */
export function createRoomLobby(context, callbacks = {}) {
	const { state, store, api, view } = context;

	async function discover(reason = "refresh") {
		try {
			const chochmahResult = await api(discoverPayload(
				projectRoot(),
				agentId()
			));
			state.lastResult = chochmahResult;
			store.setMissions(chochmahResult.missions || []);
			setStatus(
				`Showing ${state.missions.length} available rooms (${reason}).`
			);
			view.list({ join: callbacks.join });
			view.output(chochmahResult);
			return chochmahResult;
		} catch (error) {
			callbacks.onError?.(error);
			throw error;
		}
	}

	async function createRoom() {
		if (state.creatingRoom) return;
		state.creatingRoom = true;
		try {
			const malchutGoal = $("newRoomGoal")?.value
				|| templateGoal(state.selectedTemplate)
				|| "New mission room";
			const hodResult = await api(startPayload(
				malchutGoal,
				projectRoot(),
				agentId()
			));
			const yesodMissionId = hodResult.missionId
				|| hodResult.mission?.id
				|| "";
			setStatus(`Created room ${yesodMissionId}.`);
			await discover("after-create");
			if (yesodMissionId) await callbacks.join?.(yesodMissionId);
			return hodResult;
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
