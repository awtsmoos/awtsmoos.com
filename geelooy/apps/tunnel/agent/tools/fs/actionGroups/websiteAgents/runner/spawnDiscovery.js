//B"H // Boruch Hashem // Blessed is He

/**
 * @file Discovers durable website Mission and sponsor identity without historical-room ceremony.
 * @description The Awtsmoos lets one durable child request find the living lineage that already
 * contains it. Awtsmoos.com prefers explicit proof, then request-key dedupe evidence, then Mission
 * lineage and sponsor identity, and only then the newest active website Mission.
 */
function resolve(Store, input = {}) {
	const records = Store.list(200);
	const requestKey = text(input.requestKey || input.spawnRequestKey || input.childRequestId);
	const explicitWebsiteId = text(input.parentWebsiteMissionId || input.websiteMissionId);
	const missionId = text(input.parentMissionId || input.missionId);
	const sponsorHint = text(input.parentAgentId || input.sponsorAgentId || input.logicalAgentId || input.agentId);
	const selected = selectRecord(Store, records, { explicitWebsiteId, missionId, requestKey, sponsorHint });
	if (!selected.record) return { ok: false, reason: "website_mission_not_discovered", ...selected };
	const sponsor = selectSponsor(selected.record, sponsorHint, requestKey);
	if (!sponsor.agentId) return { ok: false, reason: "sponsor_agent_not_discovered", ...selected, ...sponsor };
	return {
		ok: true,
		record: selected.record,
		websiteMissionId: selected.record.id,
		missionId: selected.record.missionId || "",
		parentAgentId: sponsor.agentId,
		recordSource: selected.source,
		sponsorSource: sponsor.source,
		requestKey
	};
}

function selectRecord(Store, records, hints) {
	if (hints.explicitWebsiteId) {
		return { record: Store.read(hints.explicitWebsiteId), source: "explicit_website_mission" };
	}
	if (hints.requestKey) {
		const match = records.find(record => record.spawnRegistry?.[hints.requestKey] || record.spawnPayloadRegistry?.[hints.requestKey]);
		if (match) return { record: match, source: "request_key_registry" };
	}
	if (hints.missionId) {
		const match = records.find(record => record.missionId === hints.missionId);
		if (match) return { record: match, source: "mission_lineage" };
	}
	if (hints.sponsorHint) {
		const match = records.find(record => hasSponsor(record, hints.sponsorHint));
		if (match) return { record: match, source: "sponsor_identity" };
	}
	const active = records.find(record => !terminal(record.status));
	return { record: active || records[0] || null, source: active ? "latest_active" : records[0] ? "latest_durable" : "none" };
}

function selectSponsor(record = {}, hint = "", requestKey = "") {
	const agents = record.agents || [];
	if (hint) {
		const explicit = agents.find(agent => sameAgent(agent, hint));
		if (explicit) return { agentId: explicit.id, source: "explicit_or_runtime_identity" };
	}
	if (requestKey) {
		const childId = record.spawnRegistry?.[requestKey];
		const child = agents.find(agent => agent.id === childId || agent.spawnRequestKey === requestKey);
		if (child?.parentAgentId && agents.some(agent => agent.id === child.parentAgentId)) {
			return { agentId: child.parentAgentId, source: "request_key_parent" };
		}
	}
	const root = agents.find(agent => !agent.parentAgentId && Number(agent.depth || 0) === 0 && !terminal(agent.status));
	if (root) return { agentId: root.id, source: "active_root_agent" };
	const lead = agents.find(agent => agent.id === record.lead?.agentId);
	if (lead) return { agentId: lead.id, source: "lead_agent" };
	return { agentId: agents[0]?.id || "", source: agents[0] ? "first_durable_agent" : "none" };
}

function hasSponsor(record, hint) {
	return (record.agents || []).some(agent => sameAgent(agent, hint));
}

function sameAgent(agent = {}, hint = "") {
	return [agent.id, agent.agentSessionId, agent.logicalAgentId, agent.name].filter(Boolean).includes(hint);
}

function terminal(status) {
	return ["completed", "failed", "cancelled", "stopped"].includes(String(status || "").toLowerCase());
}

function text(value) {
	return String(value || "").trim();
}

module.exports = { hasSponsor, resolve, selectRecord, selectSponsor, terminal };
