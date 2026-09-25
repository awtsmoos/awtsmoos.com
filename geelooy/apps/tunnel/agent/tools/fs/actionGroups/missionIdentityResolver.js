//B"H // Boruch Hashem // Blessed is He

/**
 * @file Resolves mission identity across the native registry and the website registry.
 * @description The Awtsmoos lets a Shliach name a mission by any identity it truly carries.
 * Awtsmoos.com resolves direct website mission IDs, collaboration mission IDs, website child
 * agent IDs, spawn request keys, logical agent identities, and agent session identities to one
 * canonical website-mission view, so observation never depends on which handle the caller knew.
 */

const CANONICAL_STATUS_ACTION = "websiteAgentMissionStatus";

/**
 * Resolves one mission identity against an optional website record. Returns a canonical
 * identity; kind is "website_mission" when the website registry owns it, "mission" when the
 * input only names a native collaboration mission, and "unknown" otherwise.
 */
function resolve(input = {}, websiteRecord = null) {
	const ids = identityOf(input);
	const record = websiteRecord && typeof websiteRecord === "object" ? websiteRecord : null;
	const match = record ? matchRecord(ids, record) : null;
	if (match) {
		return {
			kind: "website_mission",
			registry: "website",
			websiteMissionId: record.id || "",
			collaborationMissionId: record.missionId || "",
			missionId: record.missionId || record.id || "",
			childAgentId: match.childAgentId,
			logicalAgentId: match.logicalAgentId,
			sessionId: match.sessionId,
			requestKey: match.requestKey,
			matchedBy: match.matchedBy,
			canonicalStatusAction: CANONICAL_STATUS_ACTION
		};
	}
	if (ids.missionId || ids.collaborationMissionId) {
		return {
			kind: "mission",
			registry: "native",
			websiteMissionId: "",
			collaborationMissionId: ids.collaborationMissionId || ids.missionId,
			missionId: ids.missionId || ids.collaborationMissionId,
			childAgentId: ids.childAgentId,
			logicalAgentId: ids.logicalAgentId,
			sessionId: ids.sessionId,
			requestKey: ids.requestKey,
			matchedBy: "native_mission_id",
			canonicalStatusAction: "missionGet"
		};
	}
	return {
		kind: "unknown",
		registry: "unknown",
		websiteMissionId: "",
		collaborationMissionId: "",
		missionId: "",
		childAgentId: ids.childAgentId,
		logicalAgentId: ids.logicalAgentId,
		sessionId: ids.sessionId,
		requestKey: ids.requestKey,
		matchedBy: "none",
		canonicalStatusAction: ""
	};
}

function identityOf(input = {}) {
	const first = (...values) => {
		for (const value of values) {
			if (value !== undefined && value !== null && String(value).trim() !== "") return String(value);
		}
		return "";
	};
	return {
		websiteMissionId: first(input.websiteMissionId, input.websiteId),
		missionId: first(input.missionId, input.id, input.collaborationMissionId),
		collaborationMissionId: first(input.collaborationMissionId),
		childAgentId: first(input.childAgentId, input.agentId, input.websiteAgentId),
		logicalAgentId: first(input.logicalAgentId),
		sessionId: first(input.sessionId, input.agentSessionId),
		requestKey: first(input.requestKey, input.spawnRequestKey, input.idempotencyKey)
	};
}

function matchRecord(ids, record) {
	const recordId = String(record.id || "");
	const collaborationId = String(record.missionId || "");
	if (ids.websiteMissionId && ids.websiteMissionId === recordId) {
		return agentMatch(ids, record, "website_mission_id");
	}
	if (ids.missionId && (ids.missionId === recordId || ids.missionId === collaborationId)) {
		return agentMatch(ids, record, "mission_id");
	}
	if (ids.collaborationMissionId && ids.collaborationMissionId === collaborationId) {
		return agentMatch(ids, record, "collaboration_mission_id");
	}
	const byAgent = agentMatch(ids, record, null);
	if (byAgent.matchedBy) return byAgent;
	return null;
}

function agentMatch(ids, record, matchedBy) {
	const agents = Array.isArray(record.agents) ? record.agents : [];
	for (const agent of agents) {
		if (!agent || typeof agent !== "object") continue;
		const agentId = String(agent.id || "");
		const sessionId = String(agent.agentSessionId || "");
		const spawnKey = String(agent.spawnRequestKey || "");
		const logicalId = String(agent.logicalAgentId || agentId);
		if (ids.childAgentId && agentId && ids.childAgentId === agentId) {
			return { childAgentId: agentId, logicalAgentId: logicalId, sessionId, requestKey: spawnKey, matchedBy: "website_child_agent_id" };
		}
		if (ids.sessionId && sessionId && ids.sessionId === sessionId) {
			return { childAgentId: agentId, logicalAgentId: logicalId, sessionId, requestKey: spawnKey, matchedBy: "agent_session_id" };
		}
		if (ids.requestKey && spawnKey && ids.requestKey === spawnKey) {
			return { childAgentId: agentId, logicalAgentId: logicalId, sessionId, requestKey: spawnKey, matchedBy: "spawn_request_key" };
		}
		if (ids.logicalAgentId && logicalId && ids.logicalAgentId === logicalId) {
			return { childAgentId: agentId, logicalAgentId: logicalId, sessionId, requestKey: spawnKey, matchedBy: "logical_agent_id" };
		}
	}
	if (matchedBy) {
		return { childAgentId: ids.childAgentId, logicalAgentId: ids.logicalAgentId, sessionId: ids.sessionId, requestKey: ids.requestKey, matchedBy };
	}
	return { childAgentId: "", logicalAgentId: "", sessionId: "", requestKey: "", matchedBy: "" };
}

/**
 * Builds the public website-mission observation contract: kind website_mission, explicit
 * collaborationMissionId, canonicalStatusAction, and registry-native next-step guidance.
 */
function publicView(record = {}, action = "missionGet") {
	const identity = resolve({ missionId: record.id || record.missionId }, record);
	const websiteMissionId = String(record.id || "");
	return {
		ok: true,
		action,
		kind: "website_mission",
		registry: "website",
		websiteMissionId,
		collaborationMissionId: String(record.missionId || ""),
		missionId: String(record.missionId || websiteMissionId),
		canonicalStatusAction: CANONICAL_STATUS_ACTION,
		agentCount: Array.isArray(record.agents) ? record.agents.length : 0,
		next: {
			action: CANONICAL_STATUS_ACTION,
			websiteMissionId,
			note: "Observe website missions through the website registry; native missionGet cannot see website-side agent lineage."
		},
		identity
	};
}

module.exports = {
	CANONICAL_STATUS_ACTION,
	identityOf,
	matchRecord,
	publicView,
	resolve
};
