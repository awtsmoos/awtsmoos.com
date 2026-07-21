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
import {
	applyAgentEvent,
	compareAgentChannels,
	connectionPresence,
	createAgentChannel
} from "./channelState.js";

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
		channels.set(agentId, createAgentChannel(agentId, agent));
	}
	for (const event of agentEventsForRoom(state)) {
		for (const agentId of eventAgentIds(event)) {
			if (!isAgentIdentity(agentId)) continue;
			const channel = channels.get(agentId)
				|| createAgentChannel(agentId);
			applyAgentEvent(channel, event, agentId, now);
			channels.set(agentId, channel);
		}
	}
	const presence = connectionPresence(state);
	return [...channels.values()]
		.map(channel => ({ ...channel, ...presence }))
		.sort(compareAgentChannels);
}

/** Returns deduplicated events relevant to the selected room and its agents. */
export function agentEventsForRoom(state) {
	const rosterIds = new Set(
		joinedAgents(state).map(agentIdentity).filter(Boolean)
	);
	const missionId = String(state.selectedMissionId || "");
	const accountEvents = (state.accountEvents || []).filter(event => {
		const eventRoom = eventMissionId(event);
		if (eventRoom) return eventRoom === missionId;
		return eventAgentIds(event).some(agentId => rosterIds.has(agentId));
	});
	const seen = new Set();
	return [...(state.events || []), ...accountEvents]
		.filter(event => includeOnce(event, seen))
		.sort((left, right) => String(left.at).localeCompare(String(right.at)));
}

function joinedAgents(state) {
	const agents = selectedRoom(state).agents || [];
	return Array.isArray(agents) ? agents : Object.values(agents);
}

function includeOnce(event, seen) {
	const key = event.id || event.eventId
		|| `${event.type}:${event.at}:${event.actor}:${event.target}`;
	if (seen.has(key)) return false;
	seen.add(key);
	return true;
}
