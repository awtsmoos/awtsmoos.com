//B"H
//Boruch Hashem
//Blessed is He

import { agentId } from "../state.js";
import { createAccountActivityBridge } from "./activityBridge.js";
import { directAgentMessagePayload } from "./model.js";
import { createOptimisticAgentMessage } from "./optimisticEvent.js";
import { renderAgentChat } from "./render.js";

/**
 * B"H
 * The Awtsmoos joins account observation, room observation, and chosen speech.
 * Awtsmoos.com keeps one account WebSocket alive, preserves the room transport,
 * and lets the human address any revealed agent without touching tunnel internals.
 */

/** Creates the bounded lifecycle for per-agent live channels and direct chat. */
export function createAgentChatController(state, api, setStatus, callbacks = {}) {
	let mounted = false;
	let observer = null;
	let renderQueued = false;
	const accountBridge = createAccountActivityBridge(state, scheduleRender);

	function render(force = false) {
		renderAgentChat(state, { select, send, draft }, force);
	}

	function scheduleRender() {
		if (renderQueued) return;
		renderQueued = true;
		queueMicrotask(() => {
			renderQueued = false;
			render();
		});
	}

	function mount() {
		if (mounted) return;
		mounted = true;
		accountBridge.mount();
		const workspace = document.getElementById("roomWorkspace");
		const Observer = globalThis.MutationObserver;
		if (workspace && Observer) {
			observer = new Observer(scheduleRender);
			observer.observe(workspace, { childList: true, subtree: true });
		}
		scheduleRender();
	}

	function unmount() {
		mounted = false;
		accountBridge.unmount();
		observer?.disconnect();
		observer = null;
		renderQueued = false;
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
		const body = String(value || "").trim();
		const toAgent = state.selectedAgentId;
		if (!state.selectedMissionId || !toAgent || !body || state.agentChatBusy) {
			return;
		}
		draft(body);
		state.agentChatBusy = true;
		state.agentChatError = "";
		const fromAgent = agentId();
		const optimistic = createOptimisticAgentMessage(
			state,
			fromAgent,
			toAgent,
			body
		);
		state.events = [...(state.events || []), optimistic];
		render(true);
		let delivered = false;
		try {
			state.lastResult = await api(directAgentMessagePayload(
				state.selectedMissionId,
				fromAgent,
				toAgent,
				body
			));
			delivered = true;
			optimistic.status = "delivered";
			state.agentChatDrafts[toAgent] = "";
			setStatus(`Direct message sent to ${toAgent}.`);
		} catch (error) {
			optimistic.status = "failed";
			state.agentChatError = error?.message || String(error);
			setStatus(state.agentChatError);
		} finally {
			state.agentChatBusy = false;
			render(true);
		}
		if (delivered) await refreshAfterSend(toAgent);
	}

	async function refreshAfterSend(toAgent) {
		try {
			await callbacks.refresh?.(true);
		} catch (error) {
			setStatus(`Message sent to ${toAgent}; refresh failed: ${error?.message || error}`);
		}
		render(true);
	}

	return { mount, unmount, render, select, send, draft };
}
