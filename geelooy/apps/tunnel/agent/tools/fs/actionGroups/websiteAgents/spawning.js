// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./store.js");
const Identity = require("./spawningIdentity.js");
const PeerAdmission = require("./spawningPeerAdmission.js");
const Request = require("./spawningRequest.js");

/**
 * @file Admits durable website-agent requests as flat mission peers.
 * @description Every requester is a sponsor, never an owner. Awtsmoos.com keeps all
 * admitted work at depth zero while sponsor keys preserve dedupe and activation fairness.
 */
function admit(missionId, sponsorAgentId, requests = []) {
	const result = { accepted: [], duplicates: [], rejected: [] };
	const updated = Store.update(missionId, record => {
		const sponsor = record.agents.find(agent => agent.id === sponsorAgentId);
		if (!sponsor) {
			result.rejected.push({ reason: "unknown_parent_agent" });
			return record;
		}
		record.spawnRegistry ||= {};
		record.spawnPayloadRegistry ||= {};
		sponsor.childAgentIds ||= [];
		for (const raw of requests) {
			PeerAdmission.admitOne(record, sponsor, raw, result);
		}
		return record;
	});
	return { ...result, record: updated };
}

function pending(record = {}) {
	return (record.agents || []).filter(agent =>
		(agent.isSpawnedAgent || agent.parentAgentId) && agent.roomSeeded !== false &&
		agent.round === 0 && ![
			"submitting",
			"awaiting_recovery",
			"waiting_for_login",
			"failed",
			"claim_conflict"
		].includes(agent.status)
	);
}

module.exports = {
	admit,
	normalizeRequest: Request.normalizeRequest,
	normalizeScope: Request.normalizeScope,
	pending,
	stableChildId: Identity.stableChildId
};
