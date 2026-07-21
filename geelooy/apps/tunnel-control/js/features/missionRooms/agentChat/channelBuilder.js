//B"H
//Boruch Hashem
//Blessed is He

import { selectedRoom } from "../store.js";
import {
	agentIdentity,
	eventAgentIds,
	eventMissionId,
	isAgentIdentity
} from "./eventAgents.js";

/**
 * B"H
 * One authenticated current can reveal countless distinct labors. The Awtsmoos
 * joins roster truth, room frames, and account-wide testimony; Awtsmoos.com then
 * presents each agent as a clear channel without multiplying physical sockets.
 */

/** Builds visible agent channels from roster, room, and account activity. */
export function buildAgentChannels(state, now = Date.now()) {
	const channels = new Map();
	for (const agent of joinedAgents(state)) {
		const agentId = agentIdentity(agent);
		if (!isAgentIdentity(agentId)) continue;
		channels.set(agentId, baseChannel(agentId, agent));
	}
	for (const event of agentEventsForRoom(state)) {
		for (const agentId of eventAgentIds(event)) {
			if (!isAgentIdentity(agentId)) continue;
			const channel = channels.get(agentId) || baseChannel(agentId);
			applyEvent(channel, event, now);
			channels.set(agentId, channel);
		}
	}
	return [...channels.values()]
		.map(channel => ({ ...channel, ...connectionPresence(state) }))
		.sort(compareChannels);
}

/** Returns deduplicated events relevant to the selected room and its agents. */
export function agentEventsForRoom(state) {
	const rosterIds = new Set(joinedAgents(state).map(agentIdentity).filter(Boolean));
	const missionId = String(state.selectedMissionId || "");
	const accountEvents = (state.accountEvents || []).filter(event => {
		const eventRoom = eventMissionId(event);
		if (eventRoom) return eventRoom === missionId;
		return eventAgentIds(event).some(agentId => rosterIds.has(agentId));
	});
	const seen = new Set();
	return [...(state.events || []), ...accountEvents]
		.filter(event => {
			const key = eventKey(event);
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		})
		.sort((left, right) => String(left.at).localeCompare(String(right.at)));
}

function joinedAgents(state) {
	const agents = selectedRoom(state).agents || [];
	return Array.isArray(agents) ? agents : Object.values(agents);
}

function baseChannel(agentId, agent = {}) {
	return {
		agentId,
		name: agent.name || agent.agentName || agentId,
		role: agent.role || "agent",
		status: agent.status || "observed",
		lastAt: agent.lastSeenAt || agent.joinedAt || "",
		lastType: "joined",
		activityCount: 0,
		failures: 0,
		isWorking: /active|running|working|busy/i.test(String(agent.status || ""))
	};
}

function applyEvent(channel, event, now) {
	channel.activityCount += 1;
	if (String(event.at || "") >= String(channel.lastAt || "")) {
		channel.lastAt = event.at || channel.lastAt;
		channel.lastType = event.type || channel.lastType;
	}
	const stateText = `${event.status || ""} ${event.type || ""}`;
	if (/failed|error/i.test(stateText) || event.payload?.ok === false) {
		channel.failures += 1;
	}
	const recent = now - (Date.parse(event.at || "") || 0) < 300000;
	if (recent && /completed|failed|cancelled|stopped|disconnected/i.test(stateText)) {
		channel.isWorking = false;
	} else if (recent && /started|running|working|heartbeat|action/i.test(stateText)) {
		channel.isWorking = true;
	}
}

function connectionPresence(state) {
	const roomWebSocketConnected = state.paneActive === true
		&& state.socketMode === "websocket";
	const accountWebSocketConnected = state.accountConnectionState === "connected";
	return {
		roomWebSocketConnected,
		accountWebSocketConnected,
		webSocketConnected: roomWebSocketConnected || accountWebSocketConnected,
		connectionLabel: connectionLabel(state, roomWebSocketConnected, accountWebSocketConnected)
	};
}

function connectionLabel(state, roomConnected, accountConnected) {
	if (roomConnected && accountConnected) return "Room + account WebSockets";
	if (accountConnected) return "Account WebSocket live";
	if (roomConnected) return "Room WebSocket live";
	if (state.socketMode === "eventsource") return "SSE fallback";
	if (state.accountConnectionState === "reconnecting") return "Account WebSocket reconnecting";
	if (state.socketMode === "connecting") return "Room WebSocket connecting";
	return "Waiting for live transport";
}

function eventKey(event) {
	return event.id || event.eventId
		|| `${event.type}:${event.at}:${event.actor}:${event.target}`;
}

function compareChannels(left, right) {
	if (left.isWorking !== right.isWorking) return left.isWorking ? -1 : 1;
	return String(right.lastAt).localeCompare(String(left.lastAt));
}
