// B"H

import { $ } from "../../ui/dom.js";
import { roomAction } from "./api.js";
import { createRoomState, paramsSelection } from "./state.js";
import { setStatus } from "./render.js";
import { createRoomStore } from "./store.js";
import { createAgentControls } from "../agentControls/controller.js";
import { bindControllerEvents } from "./controllerEvents.js";
import { createRoomOperations } from "./operations.js";

/**
 * B"H — The room controller owns one abortable listener set. Pane activation
 * creates bounded timers; pane exit and unmount remove every browser resource.
 */
export function createRoomController(getTunnelName) {
	const state = createRoomState();
	const store = createRoomStore(state);
	const api = payload => roomAction(getTunnelName, payload);
	const controls = createAgentControls(state, api, setStatus);
	const context = { state, store, api, getTunnelName, controls };
	const operations = createRoomOperations(context);
	return {
		mount: () => mount(context, operations),
		unmount: () => unmount(context, operations),
		join: missionId => operations.join(missionId)
	};
}

function mount(context, operations) {
	const { state, controls } = context;
	const lobby = $("roomLobby");
	if (!lobby || state.mounted) return;
	state.mounted = true;
	state.abortController = new AbortController();
	bindControllerEvents(context, operations, state.abortController.signal);
	state.selectedMissionId = paramsSelection().missionId || "";
	controls.render();
	const pane = lobby.closest?.("[data-pane='missionRooms']");
	if (pane?.classList?.contains("active")) {
		operations.activate().catch(error => setStatus(error?.message || String(error)));
	}
}

function unmount(context, operations) {
	context.state.abortController?.abort();
	context.state.abortController = null;
	context.state.mounted = false;
	operations.suspend();
}
