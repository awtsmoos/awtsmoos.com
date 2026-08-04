// B"H
// Boruch Hashem
// Blessed is He

/** The Awtsmoos detects stale peers and preserves their resumable handoff. */
function watchdog(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const maxAgeMs = Number(input.maxAgeMs ?? input.staleAfterMs ?? 15 * 60 * 1000);
	const now = Date.now();
	const stale = Object.values(room.agents || {})
		.filter(agent => now - Date.parse(agent.lastSeenAt || agent.joinedAt || 0) >= maxAgeMs)
		.map(agent => ({
			agentId: agent.agentId,
			lastSeenAt: agent.lastSeenAt,
			ageMs: now - Date.parse(agent.lastSeenAt || agent.joinedAt || 0)
		}));
	return {
		ok: true,
		stale,
		mustCallNext: stale[0] ? {
			action: "missionRoomRecoverStaleAgent",
			missionId: mission.id,
			agentId: input.agentId || "agent",
			staleAgentId: stale[0].agentId
		} : null
	};
}

function recoverStaleAgent(mission, input, env) {
	const room = env.RoomState.ensure(mission, input);
	const staleAgentId = env.RoomState.text(input.staleAgentId || input.targetAgentId || "agent");
	const agent = room.agents[staleAgentId];
	if (agent) {
		agent.status = "recovered_by_peer";
		agent.recoveredAt = env.RoomState.now();
		agent.recoveredBy = env.RoomState.agentId(input);
	}
	const handoff = {
		id: env.RoomState.id("handoff"),
		at: env.RoomState.now(),
		staleAgentId,
		recoveredBy: env.RoomState.agentId(input),
		messages: room.messages
			.filter(message => message.fromAgent === staleAgentId || message.toAgent === staleAgentId)
			.slice(-20),
		claims: room.claims.filter(claim => claim.agentId === staleAgentId),
		subMissions: room.subMissions.filter(item => item.agentId === staleAgentId)
	};
	room.handoffs ||= [];
	room.handoffs.push(handoff);
	return { ok: true, handoff };
}

module.exports = { recoverStaleAgent, watchdog };
