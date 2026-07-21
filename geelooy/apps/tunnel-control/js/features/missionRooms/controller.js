//B"H
//Boruch Hashem
//Blessed is He

import { $ } from "../../ui/dom.js";
import { roomAction } from "./api.js";
import { createRoomState, paramsSelection } from "./state.js";
import { setStatus } from "./render.js";
import { createRoomStore } from "./store.js";
import { createAgentControls } from "../agentControls/controller.js";
import { bindControllerEvents } from "./controllerEvents.js";
import { createRoomOperations } from "./operations.js";
import { createAgentChatController } from "./agentChat/controller.js";

/**
 * B"H
 * The Awtsmoos renews the room controller as one bounded conductor. The
 * authenticated room socket, continuation controls, and direct agent speech
 * remain separate vessels while Awtsmoos.com joins their life cycles without
 * disturbing the tunnel beneath them.
 */

/** Creates one isolated Mission Rooms controller and all of its browser life. */
export function createRoomController(getTunnelName) {
	const state = createRoomState();
	const store = createRoomStore(state);
	const api = payload => roomAction(getTunnelName, payload);
	const controls = createAgentControls(state, api, setStatus);
	const context = {
		state,
		store,
		api,
		getTunnelName,
		controls,
		chat: null
	};
	const operations = createRoomOperations(context);
	const chat = createAgentChatController(state, api, setStatus, {
		refresh: quiet => operations.refresh(quiet)
	});
	context.chat = chat;
	return {
		mount: () => mount(context, operations),
		unmount: () => unmount(context, operations),
		join: missionId => operations.join(missionId)
	};
}

function mount(context, operations) {
	const { state, controls, chat } = context;
	const lobby = $("roomLobby");
	if (!lobby || state.mounted) return;
	state.mounted = true;
	state.abortController = new AbortController();
	bindControllerEvents(context, operations, state.abortController.signal);
	state.selectedMissionId = paramsSelection().missionId || "";
	controls.render();
	chat.mount();
	chat.render();
	const pane = lobby.closest?.("[data-pane='missionRooms']");
	if (pane?.classList?.contains("active")) {
		operations.activate().catch(error => setStatus(error?.message || String(error)));
	}
}

function unmount(context, operations) {
	context.chat?.unmount();
	context.state.abortController?.abort();
	context.state.abortController = null;
	context.state.mounted = false;
	operations.suspend();
}
