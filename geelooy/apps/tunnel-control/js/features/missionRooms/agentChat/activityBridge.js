//B"H
//Boruch Hashem
//Blessed is He

import { activityStore } from "../../../realtime/activitySession.js";
import { eventAgentIds, eventMissionId } from "./eventAgents.js";

/**
 * B"H
 * The Awtsmoos keeps one account-wide authenticated current alive while every
 * room appears and disappears inside the interface. Awtsmoos.com receives that
 * stream once, then reveals its mission and agent testimony inside focused views.
 */

/** Bridges the always-on account WebSocket store into Mission Rooms state. */
export function createAccountActivityBridge(state, onChange = () => {}) {
	let unsubscribe = null;

	function mount() {
		if (unsubscribe) return;
		unsubscribe = activityStore.subscribe(snapshot => {
			state.accountConnectionState = snapshot.connectionState || "idle";
			state.accountEvents = (snapshot.events || [])
				.map(normalizeAccountEvent)
				.filter(Boolean);
			onChange();
		});
	}

	function unmount() {
		unsubscribe?.();
		unsubscribe = null;
		state.accountEvents = [];
		state.accountConnectionState = "idle";
	}

	return { mount, unmount };
}

/** Converts one account activity event into the shared room-event vocabulary. */
export function normalizeAccountEvent(event = {}) {
	const agentIds = eventAgentIds(event);
	const missionId = eventMissionId(event);
	if (!missionId && !agentIds.length) return null;
	const detail = event.detail || {};
	return {
		id: event.eventId || `account_${event.sequence || Date.now()}`,
		eventId: event.eventId || "",
		roomId: missionId,
		missionId,
		actor: agentIds[0] || detail.actor || "system",
		target: agentIds[1] || detail.toAgent || "room",
		type: event.eventType || "account.activity",
		title: event.summary || event.eventType || "Account activity",
		at: event.timestamp || new Date().toISOString(),
		status: event.state || event.severity || "observed",
		source: "account-websocket",
		payload: {
			...detail,
			agentId: event.agentId || detail.agentId,
			logicalAgentId: event.logicalAgentId || detail.logicalAgentId,
			fromAgent: detail.fromAgent,
			toAgent: detail.toAgent,
			missionId,
			sequence: event.sequence
		}
	};
}
