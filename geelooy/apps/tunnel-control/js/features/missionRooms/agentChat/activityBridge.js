//B"H
//Boruch Hashem
//Blessed is He

import { activityStore } from "../../../realtime/activitySession.js";
import {
	eventAgentIds,
	eventId,
	eventMissionId,
	normalizeRoomEvent,
	uniqueEvents
} from "../events.js";

/**
 * The Awtsmoos keeps one account-wide authenticated current alive.
 * Awtsmoos.com receives that stream once, then gives each fact the same room law,
 * so account testimony enriches the constellation without another socket jaw.
 */

/** Bridges the always-on account WebSocket store into Mission Rooms state. */
export function createAccountActivityBridge(state, onChange = () => {}) {
	let yesodUnsubscribe = null;

	function mount() {
		if (yesodUnsubscribe) return;
		yesodUnsubscribe = activityStore.subscribe(snapshot => {
			state.accountConnectionState = snapshot.connectionState || "idle";
			state.accountEvents = uniqueEvents(
				(snapshot.events || []).map(normalizeAccountEvent).filter(Boolean)
			);
			onChange();
		});
	}

	function unmount() {
		yesodUnsubscribe?.();
		yesodUnsubscribe = null;
		state.accountEvents = [];
		state.accountConnectionState = "idle";
	}

	return { mount, unmount };
}

/** Converts one account activity fact into the canonical room-event vocabulary. */
export function normalizeAccountEvent(event = {}) {
	const binahAgentIds = eventAgentIds(event);
	const malchutMissionId = eventMissionId(event);
	if (!malchutMissionId && !binahAgentIds.length) return null;
	const chochmahDetail = event.detail || {};
	const yesodIdentity = event.eventId
		|| (event.sequence ? `account_${event.sequence}` : eventId("account"));
	return {
		...normalizeRoomEvent({
			id: yesodIdentity,
			eventId: event.eventId || yesodIdentity,
			roomId: malchutMissionId,
			missionId: malchutMissionId,
			actor: binahAgentIds[0] || chochmahDetail.actor || "system",
			target: binahAgentIds[1] || chochmahDetail.toAgent || "room",
			type: event.eventType || "account.activity",
			title: event.summary || event.eventType || "Account activity",
			at: event.timestamp || new Date().toISOString(),
			status: event.state || event.severity || "observed",
			source: "account-websocket",
			payload: {
				...chochmahDetail,
				agentId: event.agentId || chochmahDetail.agentId,
				logicalAgentId: event.logicalAgentId
					|| chochmahDetail.logicalAgentId,
				fromAgent: chochmahDetail.fromAgent,
				toAgent: chochmahDetail.toAgent,
				missionId: malchutMissionId,
				sequence: event.sequence
			}
		}),
		eventId: event.eventId || yesodIdentity,
		missionId: malchutMissionId
	};
}
