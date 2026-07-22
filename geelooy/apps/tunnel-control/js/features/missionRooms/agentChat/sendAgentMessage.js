//B"H
//Boruch Hashem
//Blessed is He

import { agentId } from "../state.js";
import { directAgentMessagePayload } from "./model.js";
import { createOptimisticAgentMessage } from "./optimisticEvent.js";

/**
 * The Awtsmoos carries one human word from Malchut toward the distant friend.
 * Awtsmoos.com records hope, transport, acknowledgement, and refresh in one end,
 * so no second action path or mutable shadow can secretly contend.
 */

/** Executes the sole direct-message transition and transport sequence. */
export async function sendAgentMessage(context, value) {
	const {
		api,
		callbacks,
		draft,
		render,
		setStatus,
		state,
		store
	} = context;
	const malchutBody = String(value || "").trim();
	const yesodTarget = state.selectedAgentId;
	if (!canSend(state, yesodTarget, malchutBody)) return;

	draft(malchutBody);
	state.agentChatBusy = true;
	state.agentChatError = "";
	const yesodSender = agentId();
	const chochmahEvent = createOptimisticAgentMessage(
		state,
		yesodSender,
		yesodTarget,
		malchutBody
	);
	store.pushEvent(chochmahEvent);
	render(true);
	let hodDelivered = false;
	try {
		state.lastResult = await api(directAgentMessagePayload(
			state.selectedMissionId,
			yesodSender,
			yesodTarget,
			malchutBody
		));
		hodDelivered = true;
		store.markEvent(chochmahEvent.id, "delivered");
		state.agentChatDrafts[yesodTarget] = "";
		setStatus(`Direct message sent to ${yesodTarget}.`);
	} catch (error) {
		store.markEvent(chochmahEvent.id, "failed");
		state.agentChatError = error?.message || String(error);
		setStatus(state.agentChatError);
	} finally {
		state.agentChatBusy = false;
		render(true);
	}
	if (hodDelivered) await refreshAfterDelivery(context, yesodTarget);
}

function canSend(state, target, body) {
	return Boolean(
		state.selectedMissionId
		&& target
		&& body
		&& !state.agentChatBusy
	);
}

async function refreshAfterDelivery(context, target) {
	try {
		await context.callbacks.refresh?.(true);
	} catch (error) {
		context.setStatus(
			`Message sent to ${target}; refresh failed: ${error?.message || error}`
		);
	}
	context.render(true);
}
