//B"H
//Boruch Hashem
//Blessed is He

import { selectedRoom } from "../store.js";

/**
 * B"H
 * The Awtsmoos renews one room-socket breath and reveals within it the many
 * distinct voices of its agents. Awtsmoos.com does not multiply fragile wires;
 * it gathers every worker into clear logical channels over one verified vessel.
 */

const NON_AGENT_IDENTITIES = new Set([
	"",
	"all",
	"room",
	"system",
	"user",
	"control-room-human"
]);

/** Builds every visible agent channel from joined agents and live events. */
export function buildAgentChannels(state, now = Date.now()) {
	const channels = new Map();
	for (const agent of joinedAgents(state)) {
		const agentId = identity(agent);
		if (!isAgentIdentity(agentId)) continue;
		channels.set(agentId, baseChannel(agentId, agent));
	}
	for (const event of state.events || []) {
		for (const agentId of eventAgentIds(event)) {
			if (!isAgentIdentity(agentId)) continue;
			const channel = channels.get(agentId) || baseChannel(agentId);
			applyEvent(channel, event, now);
			channels.set(agentId, channel);
		}
	}
	return [...channels.values()]
		.map(channel => ({ ...channel, ...socketPresence(state, channel) }))
		.sort(compareChannels);
}

/** Keeps a valid selected agent and chooses the most active channel otherwise. */
export function ensureSelectedAgent(state, channels = []) {
	if (channels.some(channel => channel.agentId === state.selectedAgentId)) {
		return state.selectedAgentId;
	}
	state.selectedAgentId = channels.find(channel => channel.isWorking)?.agentId
		|| channels[0]?.agentId
		|| "";
	return state.selectedAgentId;
}

/** Returns recent message-like events involving one agent. */
export function agentConversation(state, agentId) {
	return (state.events || [])
		.filter(event => eventAgentIds(event).includes(agentId))
		.filter(event => /message|response|chat/i.test(String(event.type || "")) || event.payload?.body)
		.sort((left, right) => String(left.at).localeCompare(String(right.at)));
}

/** Creates the exact existing missionAgentMessage action payload. */
export function directAgentMessagePayload(missionId, fromAgent, toAgent, body) {
	return {
		action: "missionAgentMessage",
		missionId: String(missionId || "").trim(),
		agentId: String(fromAgent || "control-room-human").trim(),
		toAgent: String(toAgent || "").trim(),
		kind: "user-direct-message",
		body: String(body || "").trim(),
		requiresResponse: true
	};
}

function joinedAgents(state) {
	const agents = selectedRoom(state).agents || [];
	return Array.isArray(agents) ? agents : Object.values(agents);
}

function identity(value = {}) {
	return String(value.agentId || value.logicalAgentId || value.id || value.name || "").trim();
}

function isAgentIdentity(agentId) {
	return !NON_AGENT_IDENTITIES.has(String(agentId || "").toLowerCase());
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

function eventAgentIds(event = {}) {
	const payload = event.payload || {};
	const input = payload.input || {};
	const message = payload.message || {};
	return [...new Set([
		event.actor,
		event.target,
		payload.agentId,
		payload.fromAgent,
		payload.toAgent,
		input.agentId,
		input.logicalAgentId,
		input.toAgent,
		message.fromAgent,
		message.toAgent
	].map(value => String(value || "").trim()).filter(Boolean))];
}

function applyEvent(channel, event, now) {
	channel.activityCount += 1;
	channel.lastAt = event.at || channel.lastAt;
	channel.lastType = event.type || channel.lastType;
	if (event.status === "failed" || event.payload?.ok === false) channel.failures += 1;
	const age = now - (Date.parse(event.at || "") || 0);
	channel.isWorking = channel.isWorking || age < 300000 || /start|run|working|heartbeat|action/i.test(String(event.type || ""));
}

function socketPresence(state, channel) {
	const webSocketConnected = state.paneActive === true && state.socketMode === "websocket";
	return {
		...channel,
		webSocketConnected,
		connectionLabel: webSocketConnected
			? "WebSocket live"
			: state.socketMode === "eventsource"
				? "SSE fallback"
				: state.socketMode === "connecting"
					? "Connecting"
					: "Waiting for room socket"
	};
}

function compareChannels(left, right) {
	if (left.isWorking !== right.isWorking) return left.isWorking ? -1 : 1;
	return String(right.lastAt).localeCompare(String(left.lastAt));
}
