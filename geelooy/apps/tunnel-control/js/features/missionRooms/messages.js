// B"H
// Boruch Hashem
// Blessed is He

import { $ } from "../../ui/dom.js";
import { websiteMissionIdFor } from "../websiteMissionRegistry.js";
import { normalizeRoomEvent } from "./events.js";
import { updateDeliveryState } from "./recipientPicker.js";
import {
	recipientDescription,
	recipientRoute,
	validateRecipientRoute
} from "./recipientRouting.js";
import { agentId } from "./state.js";

/** Builds one durable one/some/all/team user-message action without body fan-out. */
export function messagePayload(missionId, body, forceContinue, blockAgents, routing = {}) {
	const clean = String(body || "").trim();
	const text = forceContinue ? `${clean}\ncontinue`.trim() : clean;
	const route = Object.keys(routing || {}).length ? routing : { toAgent: "all" };
	const websiteMissionId = websiteMissionIdFor(missionId);
	if (websiteMissionId) {
		return {
			action: "websiteAgentMissionMessage",
			targetVessel: "native-tunnel",
			websiteMissionId,
			missionId,
			agentId: agentId(),
			...route,
			body: text,
			requiresResponse: !forceContinue && blockAgents,
			allowContinue: true
		};
	}
	return {
		action: "missionRoomUserMessage",
		targetVessel: "native-tunnel",
		missionId,
		agentId: agentId(),
		...route,
		body: text,
		requiresResponse: !forceContinue && blockAgents,
		allowContinue: Boolean(forceContinue)
	};
}

export function optimisticMessageEvent(state, body, forceContinue = false) {
	return normalizeRoomEvent({
		missionId: state.selectedMissionId,
		actor: "human",
		target: recipientDescription(state),
		type: forceContinue ? "continue-message" : "user-message",
		title: body || "continue",
		body,
		at: new Date().toISOString(),
		status: "sending"
	}, { roomId: state.selectedMissionId });
}

/** Sends through the canonical room store so optimistic state has one writer. */
export async function send(state, api, store, forceContinue = false) {
	if (!state.selectedMissionId) throw new Error("open_a_room_first");
	const body = $("roomMessage")?.value || "";
	if (!forceContinue && !String(body).trim()) throw new Error("Write a message first.");
	const block = $("roomBlockAgents")?.checked !== false;
	const routing = validateRecipientRoute(state, recipientRoute(state));
	const optimistic = store.pushEvent(optimisticMessageEvent(state, body, forceContinue));
	updateDeliveryState(state, "sending", `Sending to ${recipientDescription(state)}…`);
	try {
		const got = await api(messagePayload(
			state.selectedMissionId,
			body,
			forceContinue,
			block,
			routing
		));
		if ($("roomMessage")) $("roomMessage").value = "";
		store.markEvent(optimistic.id, "delivered");
		state.selected = got;
		state.lastResult = got;
		updateDeliveryState(
			state,
			"delivered",
			`Durably acknowledged for ${recipientDescription(state)}.`
		);
		return got;
	} catch (error) {
		store.markEvent(optimistic.id, "failed");
		updateDeliveryState(state, "failed", `Send failed: ${error?.message || error}`);
		throw error;
	}
}

export function roomLink(state) {
	const url = new URL(location.href);
	url.searchParams.set("room", state.selectedMissionId || "");
	return url.toString();
}

export async function copyRoomLink(state) {
	const link = roomLink(state);
	await navigator.clipboard?.writeText?.(link);
	return link;
}
