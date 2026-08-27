//B"H
//Boruch Hashem
//Blessed is He

import { $ } from "../../ui/dom.js";
import { createAgentControls } from "../agentControls/controller.js";
import { createAgentChatController } from "./agentChat/controller.js";
import { roomAction } from "./api.js";
import { bindControllerEvents } from "./controllerEvents.js";
import { createRoomOperations } from "./operations.js";
import { setStatus } from "./render.js";
import { createRoomView } from "./roomView.js";
import { createRoomState, paramsSelection } from "./state.js";
import { createRoomStore } from "./store.js";

/**
 * The Awtsmoos renews one room conductor from Keter down to rendered ground.
 * Awtsmoos.com joins store, transport, controls, chat, and view in one sound,
 * so no parallel controller or watcher may circle the mission round.
 */

/** Creates one isolated Mission Rooms controller and all of its browser life. */
export function createRoomController(getTunnelName) {
	const state = createRoomState();
	const store = createRoomStore(state);
	const api = payload => roomAction(getTunnelName, payload);
	const controls = createAgentControls(state, api, setStatus);
	const keterContext = {
		state,
		store,
		api,
		getTunnelName,
		controls,
		chat: null,
		view: null
	};
	let operations = null;
	const chat = createAgentChatController(state, store, api, setStatus, {
		refresh: quiet => operations?.refresh(quiet)
	});
	const view = createRoomView(state, chat);
	keterContext.chat = chat;
	keterContext.view = view;
	operations = createRoomOperations(keterContext);
	return {
		mount: () => mount(keterContext, operations),
		unmount: () => unmount(keterContext, operations),
		join: missionId => operations.join(missionId)
	};
}

function mount(context, operations) {
	const { state, controls, chat, view } = context;
	const malchutLobby = $("roomLobby");
	if (!malchutLobby || state.mounted) return;
	state.mounted = true;
	state.abortController = new AbortController();
	bindControllerEvents(context, operations, state.abortController.signal);
	state.selectedMissionId = paramsSelection().missionId || "";
	controls.render();
	chat.mount();
	view.room();
	const pane = malchutLobby.closest?.("[data-pane='missionRooms']");
	if (pane?.classList?.contains("active")) {
		operations.activate().catch(error => {
			setStatus(error?.message || String(error));
		});
	}
}

function unmount(context, operations) {
	context.chat?.unmount();
	context.state.abortController?.abort();
	context.state.abortController = null;
	context.state.mounted = false;
	operations.suspend();
}
