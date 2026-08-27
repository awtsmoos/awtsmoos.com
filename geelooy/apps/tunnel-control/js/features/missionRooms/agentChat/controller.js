//B"H
//Boruch Hashem
//Blessed is He

import { createAccountActivityBridge } from "./activityBridge.js";
import { renderAgentChat } from "./render.js";
import { sendAgentMessage } from "./sendAgentMessage.js";

/**
 * The Awtsmoos joins account observation, room projection, and chosen speech.
 * Awtsmoos.com keeps one lifecycle, one render gate, and one send path in reach,
 * with no observer-shadow watching a DOM that another controller must teach.
 */

/** Creates the bounded lifecycle for per-agent live channels and direct chat. */
export function createAgentChatController(
	state,
	store,
	api,
	setStatus,
	callbacks = {}
) {
	let keterMounted = false;
	let netzachRenderQueued = false;
	const yesodBridge = createAccountActivityBridge(state, scheduleRender);

	function render(force = false) {
		renderAgentChat(state, { select, send, draft }, force);
	}

	function scheduleRender() {
		if (netzachRenderQueued) return;
		netzachRenderQueued = true;
		queueMicrotask(() => {
			netzachRenderQueued = false;
			render();
		});
	}

	function mount() {
		if (keterMounted) return;
		keterMounted = true;
		yesodBridge.mount();
		scheduleRender();
	}

	function unmount() {
		keterMounted = false;
		yesodBridge.unmount();
		netzachRenderQueued = false;
	}

	function select(selectedAgentId) {
		state.selectedAgentId = String(selectedAgentId || "");
		state.agentChatError = "";
		render(true);
	}

	function draft(value) {
		if (!state.selectedAgentId) return;
		state.agentChatDrafts[state.selectedAgentId] = String(value || "");
	}

	async function send(value) {
		await sendAgentMessage({
			api,
			callbacks,
			draft,
			render,
			setStatus,
			state,
			store
		}, value);
	}

	return {
		mount,
		unmount,
		render,
		select,
		send,
		draft
	};
}
