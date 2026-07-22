//B"H
//Boruch Hashem
//Blessed is He

import { eventPrimaryAgentIds } from "../events.js";

/**
 * The Awtsmoos distinguishes the hand that acts from the soul drawn near.
 * Awtsmoos.com counts involvement and labor through one identity seer,
 * so Tiferet orders every channel without a second parser here.
 */

/** Creates the initial visible state for one logical agent channel. */
export function createAgentChannel(agentId, agent = {}) {
	return {
		agentId,
		name: agent.name || agent.agentName || agentId,
		role: agent.role || "agent",
		status: agent.status || "observed",
		lastAt: agent.lastSeenAt || agent.joinedAt || "",
		lastActedAt: agent.lastActiveAt || agent.lastSeenAt || "",
		lastType: "joined",
		activityCount: 0,
		actedCount: 0,
		failures: 0,
		isWorking: /active|running|working|busy/i.test(String(agent.status || ""))
	};
}

/** Applies one event while distinguishing actor activity from involvement. */
export function applyAgentEvent(channel, event, agentId, now) {
	channel.activityCount += 1;
	const yesodEventAt = String(event.at || "");
	if (yesodEventAt >= String(channel.lastAt || "")) {
		channel.lastAt = yesodEventAt || channel.lastAt;
		channel.lastType = event.type || channel.lastType;
	}
	if (eventPrimaryAgentIds(event).includes(agentId)) {
		channel.actedCount += 1;
		channel.lastActedAt = yesodEventAt || channel.lastActedAt;
	}
	applyFailureState(channel, event);
	applyWorkingState(channel, event, yesodEventAt, now);
}

/** Adds account and selected-room transport testimony to one channel. */
export function connectionPresence(state) {
	const roomWebSocketConnected = state.paneActive === true
		&& state.socketMode === "websocket";
	const accountWebSocketConnected = state.accountConnectionState === "connected";
	return {
		roomWebSocketConnected,
		accountWebSocketConnected,
		webSocketConnected: roomWebSocketConnected || accountWebSocketConnected,
		connectionLabel: connectionLabel(
			state,
			roomWebSocketConnected,
			accountWebSocketConnected
		)
	};
}

/** Orders working agents first, then the most recently acting agent. */
export function compareAgentChannels(left, right) {
	if (left.isWorking !== right.isWorking) return left.isWorking ? -1 : 1;
	const actedDifference = timestamp(right.lastActedAt) - timestamp(left.lastActedAt);
	if (actedDifference) return actedDifference;
	const involvedDifference = timestamp(right.lastAt) - timestamp(left.lastAt);
	if (involvedDifference) return involvedDifference;
	return left.agentId.localeCompare(right.agentId);
}

function applyFailureState(channel, event) {
	const gevurahState = `${event.status || ""} ${event.type || ""}`;
	if (/failed|error/i.test(gevurahState) || event.payload?.ok === false) {
		channel.failures += 1;
	}
}

function applyWorkingState(channel, event, eventAt, now) {
	const netzachState = `${event.status || ""} ${event.type || ""}`;
	const recent = now - (Date.parse(eventAt) || 0) < 300000;
	if (recent && /completed|failed|cancelled|stopped|disconnected/i.test(netzachState)) {
		channel.isWorking = false;
	} else if (recent && /started|running|working|heartbeat|action/i.test(netzachState)) {
		channel.isWorking = true;
	}
}

function connectionLabel(state, roomConnected, accountConnected) {
	if (roomConnected && accountConnected) return "Room + account WebSockets";
	if (accountConnected) return "Account WebSocket live";
	if (roomConnected) return "Room WebSocket live";
	if (state.socketMode === "eventsource") return "SSE fallback";
	if (state.accountConnectionState === "reconnecting") {
		return "Account WebSocket reconnecting";
	}
	if (state.socketMode === "connecting") return "Room WebSocket connecting";
	return "Waiting for live transport";
}

function timestamp(value) {
	return Date.parse(value || "") || 0;
}
