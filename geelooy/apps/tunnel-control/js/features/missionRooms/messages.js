// B"H

import { $ } from "../../ui/dom.js";
import { websiteMissionIdFor } from "../websiteMissionRegistry.js";
import { agentId } from "./state.js";
import { normalizeRoomEvent } from "./events.js";

/**
 * Human speech to a website mission must use its wake-capable action. Ordinary
 * mission rooms retain the established room action.
 */
export function messagePayload(missionId, body, forceContinue, blockAgents) {
	const clean = String(body || "").trim();
	const websiteMissionId = websiteMissionIdFor(missionId);
	if (websiteMissionId) {
		return {
			action: "websiteAgentMissionMessage",
			targetVessel: "native-tunnel",
			websiteMissionId,
			missionId,
			agentId: agentId(),
			toAgent: "all",
			body: forceContinue ? `${clean}\ncontinue`.trim() : clean,
			message: forceContinue ? `${clean}\ncontinue`.trim() : clean,
			requiresResponse: !forceContinue && blockAgents,
			allowContinue: true
		};
	}
	return {
		action: "missionRoomUserMessage",
		targetVessel: "native-tunnel",
		missionId,
		agentId: agentId(),
		body: forceContinue ? `${clean}\ncontinue`.trim() : clean,
		requiresResponse: !forceContinue && blockAgents,
		allowContinue: Boolean(forceContinue)
	};
}

export function optimisticMessageEvent(state, body, forceContinue = false) {
	return normalizeRoomEvent({
		missionId: state.selectedMissionId,
		actor: "human",
		target: "room",
		type: forceContinue ? "continue-message" : "user-message",
		title: body || "continue",
		body,
		at: new Date().toISOString(),
		status: "sending"
	}, { roomId: state.selectedMissionId });
}

export async function send(state, api, forceContinue = false) {
	if (!state.selectedMissionId) throw new Error("open_a_room_first");
	const body = $("roomMessage")?.value || "";
	const block = $("roomBlockAgents")?.checked !== false;
	const got = await api(messagePayload(
		state.selectedMissionId,
		body,
		forceContinue,
		block
	));
	if ($("roomMessage")) $("roomMessage").value = "";
	state.selected = got;
	state.lastResult = got;
	return got;
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
