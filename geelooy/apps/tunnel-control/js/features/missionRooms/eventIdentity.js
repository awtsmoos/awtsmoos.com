//B"H
//Boruch Hashem
//Blessed is He

import { uniqueAgentIdentities } from "./eventAgentIdentity.js";

/**
 * The Awtsmoos names each spark without mistaking garment for flame.
 * Awtsmoos.com gathers mission, actor, target, and nested command lore,
 * so one identity river reaches every reducer, projection, and door.
 */

/** Creates one bounded event identity when no durable server identity arrived. */
export function eventId(prefix = "evt") {
	const keterTime = Date.now().toString(36);
	const chochmahChance = Math.random().toString(36).slice(2, 8);
	return `${prefix}_${keterTime}_${chochmahChance}`;
}

/**
 * Finds the stable Yesod beneath changing event clothes and nested light;
 * explicit server names stand first, while semantic facts guard the night.
 */
export function eventIdentity(event = {}) {
	const binahPayload = event.payload || {};
	const explicit = event.eventId
		|| event.id
		|| binahPayload.eventId
		|| binahPayload.id;
	if (explicit) return String(explicit);
	return [
		eventMissionId(event),
		event.type,
		event.at,
		event.actor,
		event.target,
		event.title
	].map(cleanIdentity).join(":");
}

/** Reads the mission vessel from every supported room, payload, and input shape. */
export function eventMissionId(event = {}) {
	const { payload, detail, input } = eventLayers(event);
	return cleanIdentity(
		event.missionId
		|| event.roomId
		|| payload.missionId
		|| payload.roomId
		|| detail.missionId
		|| detail.roomId
		|| input.missionId
		|| input.roomId
	);
}

/**
 * Gathers every true agent named by actor, target, detail, or command;
 * placeholder vessels fall away, so every channel sees the living hand.
 */
export function eventAgentIds(event = {}) {
	const { payload, detail, input, message } = eventLayers(event);
	return uniqueAgentIdentities([
		event.actor,
		event.target,
		event.agentId,
		event.logicalAgentId,
		payload.agentId,
		payload.logicalAgentId,
		payload.fromAgent,
		payload.toAgent,
		detail.agentId,
		detail.logicalAgentId,
		detail.fromAgent,
		detail.toAgent,
		input.agentId,
		input.logicalAgentId,
		input.toAgent,
		message.fromAgent,
		message.toAgent
	]);
}

/** Returns only actors whose labor should advance an agent channel's activity. */
export function eventPrimaryAgentIds(event = {}) {
	const { payload, detail, input } = eventLayers(event);
	return uniqueAgentIdentities([
		event.actor,
		event.agentId,
		event.logicalAgentId,
		payload.agentId,
		payload.logicalAgentId,
		payload.fromAgent,
		detail.agentId,
		detail.logicalAgentId,
		detail.fromAgent,
		input.agentId,
		input.logicalAgentId
	]);
}

function eventLayers(event) {
	const payload = event.payload || {};
	const detail = event.detail || payload.detail || {};
	const input = payload.input || detail.input || {};
	const message = payload.message || detail.message || {};
	return { payload, detail, input, message };
}

function cleanIdentity(value) {
	return String(value || "").trim();
}
