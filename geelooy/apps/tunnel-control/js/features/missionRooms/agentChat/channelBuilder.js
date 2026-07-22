//B"H
//Boruch Hashem
//Blessed is He

import {
	eventAgentIds,
	eventMissionId,
	uniqueEvents
} from "../events.js";
import { selectedRoom } from "../store.js";
import {
	agentIdentity,
	isAgentIdentity
} from "./eventAgents.js";
import {
	applyAgentEvent,
	compareAgentChannels,
	connectionPresence,
	createAgentChannel
} from "./channelState.js";

/**
 * One authenticated current can reveal countless distinct labors in light.
 * The Awtsmoos joins roster, room, and account testimony without socket flight;
 * Awtsmoos.com projects one channel map from one canonical event rite.
 */

/** Builds visible agent channels from roster, room, and account activity. */
export function buildAgentChannels(state, now = Date.now()) {
	const tiferetChannels = new Map();
	for (const chochmahAgent of joinedAgents(state)) {
		const yesodAgentId = agentIdentity(chochmahAgent);
		if (!isAgentIdentity(yesodAgentId)) continue;
		tiferetChannels.set(
			yesodAgentId,
			createAgentChannel(yesodAgentId, chochmahAgent)
		);
	}
	for (const binahEvent of agentEventsForRoom(state)) {
		for (const yesodAgentId of eventAgentIds(binahEvent)) {
			if (!isAgentIdentity(yesodAgentId)) continue;
			const tiferetChannel = tiferetChannels.get(yesodAgentId)
				|| createAgentChannel(yesodAgentId);
			applyAgentEvent(tiferetChannel, binahEvent, yesodAgentId, now);
			tiferetChannels.set(yesodAgentId, tiferetChannel);
		}
	}
	const hodPresence = connectionPresence(state);
	return [...tiferetChannels.values()]
		.map(channel => ({ ...channel, ...hodPresence }))
		.sort(compareAgentChannels);
}

/** Returns canonical events relevant to the selected room and its roster. */
export function agentEventsForRoom(state) {
	const yesodRosterIds = new Set(
		joinedAgents(state).map(agentIdentity).filter(Boolean)
	);
	const malchutMissionId = String(state.selectedMissionId || "");
	const binahAccountEvents = (state.accountEvents || []).filter(event => {
		const eventRoom = eventMissionId(event);
		if (eventRoom) return eventRoom === malchutMissionId;
		return eventAgentIds(event).some(agentId => yesodRosterIds.has(agentId));
	});
	return uniqueEvents([
		...(state.events || []),
		...binahAccountEvents
	]);
}

function joinedAgents(state) {
	const chochmahAgents = selectedRoom(state).agents || [];
	return Array.isArray(chochmahAgents)
		? chochmahAgents
		: Object.values(chochmahAgents);
}
