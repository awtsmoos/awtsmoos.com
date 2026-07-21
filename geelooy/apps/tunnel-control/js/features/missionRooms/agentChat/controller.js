//B"H
//Boruch Hashem
//Blessed is He

import { agentId } from "../state.js";
import { directAgentMessagePayload } from "./model.js";
import { renderAgentChat } from "./render.js";

/**
 * B"H
 * The Awtsmoos joins observation and speech: the same room whose events arrive
 * through a verified WebSocket becomes the vessel through which a human may
 * address one agent. Awtsmoos.com guards the boundary without touching the
 * tunnel engine beneath it.
 */

/** Creates the bounded lifecycle for per-agent live channels and direct chat. */
export function createAgentChatController(state, api, setStatus, callbacks = {}) {
	let observer = null;
	let renderQueued = false;

	function render(force = false) {
		renderAgentChat(state, { select, send }, force);
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
		if (observer) return;
		const workspace = document.getElementById("roomWorkspace");
		const Observer = globalThis.MutationObserver;
		if (workspace && Observer) {
			observer = new Observer(scheduleRender);
			observer.observe(workspace, { childList: true, subtree: true });
		}
		scheduleRender();
	}

	function unmount() {
		observer?.disconnect();
		observer = null;
		renderQueued = false;
	}

	function select(selectedAgentId) {
		state.selectedAgentId = String(selectedAgentId || "");
		state.agentChatError = "";
		render(true);
	}

	async function send(value) {
		const body = String(value || "").trim();
		const toAgent = state.selectedAgentId;
		if (!state.selectedMissionId || !toAgent || !body || state.agentChatBusy) return;
		state.agentChatDraft = body;
		state.agentChatBusy = true;
		state.agentChatError = "";
		const optimistic = optimisticEvent(state, toAgent, body);
		state.events = [...(state.events || []), optimistic];
		render(true);
		try {
			const result = await api(directAgentMessagePayload(
				state.selectedMissionId,
				agentId(),
				toAgent,
				body
			));
			state.lastResult = result;
			state.agentChatDraft = "";
			optimistic.status = "delivered";
			setStatus(`Direct message sent to ${toAgent}.`);
			await callbacks.refresh?.(true);
		} catch (error) {
			optimistic.status = "failed";
			state.agentChatError = error?.message || String(error);
			setStatus(state.agentChatError);
		} finally {
			state.agentChatBusy = false;
			render(true);
		}
	}

	return { mount, unmount, render, select, send };
}

function optimisticEvent(state, toAgent, body) {
	return {
		id: `direct_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
		roomId: state.selectedMissionId,
		actor: agentId(),
		target: toAgent,
		type: "mission_agent_message",
		title: body,
		at: new Date().toISOString(),
		status: "sending",
		payload: {
			fromAgent: agentId(),
			toAgent,
			body,
			kind: "user-direct-message"
		}
	};
}
