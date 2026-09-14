// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Owns Mission Control one/some/all/team/any recipient state and payload routing.
 * @description The Awtsmoos keeps recipient intent in one small browser-memory vessel;
 * Awtsmoos.com sends one message body plus bounded metadata instead of cloning speech.
 */
export function ensureRecipientState(state) {
	if (state.recipientRoomId !== state.selectedMissionId) {
		state.recipientRoomId = state.selectedMissionId || "";
		state.recipientMode = "all";
		state.recipientAgents = [];
		state.recipientOne = "";
		state.recipientTeam = "";
		state.recipientSearch = "";
		state.roomMessageDelivery = null;
	}
	state.recipientMode ||= "all";
	state.recipientAgents ||= [];
	return state;
}

export function availableAgents(state) {
	const selected = state.selected || {};
	const sources = [
		selected.roomStatus?.agents,
		selected.collaboration?.agents,
		selected.status?.roomStatus?.agents,
		selected.status?.collaboration?.agents,
		selected.mission?.room?.agents
	];
	const values = sources.flatMap(source => Array.isArray(source)
		? source
		: source && typeof source === "object" ? Object.values(source) : []);
	const unique = new Map();
	for (const item of values) {
		const agentId = String(item?.agentId || item?.id || "").trim();
		if (!agentId || unique.has(agentId)) continue;
		unique.set(agentId, {
			agentId,
			name: String(item?.name || item?.role || agentId),
			status: String(item?.status || "active"),
			spawnGroupId: String(item?.spawnGroupId || "")
		});
	}
	return [...unique.values()];
}

export function availableTeams(state) {
	return [...new Set(availableAgents(state)
		.map(agent => agent.spawnGroupId)
		.filter(Boolean))].sort();
}

export function recipientRoute(state) {
	ensureRecipientState(state);
	if (state.recipientMode === "selected") {
		return { toAgent: "selected_agents", toAgents: [...new Set(state.recipientAgents)] };
	}
	if (state.recipientMode === "one") return { toAgent: String(state.recipientOne || "") };
	if (state.recipientMode === "team") {
		return { toAgent: "spawn_group", toSpawnGroup: String(state.recipientTeam || "") };
	}
	if (state.recipientMode === "any") return { toAgent: "any_agent" };
	return { toAgent: "all" };
}

export function validateRecipientRoute(state, route = recipientRoute(state)) {
	if (state.recipientMode === "selected" && !route.toAgents?.length) {
		throw new Error("Select at least one agent before sending.");
	}
	if (state.recipientMode === "one" && !route.toAgent) {
		throw new Error("Choose one agent before sending.");
	}
	if (state.recipientMode === "team" && !route.toSpawnGroup) {
		throw new Error("Choose a team before sending.");
	}
	return route;
}

export function recipientDescription(state) {
	const route = recipientRoute(state);
	if (route.toAgents?.length) return `${route.toAgents.length} selected agents`;
	if (route.toSpawnGroup) return `team ${route.toSpawnGroup}`;
	if (route.toAgent === "any_agent") return "any available agent";
	if (route.toAgent === "all") return "all agents";
	return route.toAgent || "no recipient";
}
