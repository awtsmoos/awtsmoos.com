// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./spawningIdentity.js");
const PeerRecord = require("./spawningPeerRecord.js");
const Request = require("./spawningRequest.js");

/** Admits one request as a depth-zero peer sponsored by an existing mission agent. */
function admitOne(record, sponsor, raw, result) {
	const request = Request.normalizeRequest(record.plan.projectRoot, raw);
	if (!request) {
		result.rejected.push({ reason: "invalid_spawn_request" });
		return;
	}
	const registryKey = `${sponsor.id}:${request.key}`;
	if (duplicateRequest(record, registryKey, request, result)) return;
	const payloadKey = Identity.stablePayloadKey(sponsor.id, request);
	if (duplicatePayload(record, registryKey, payloadKey, sponsor, request, result)) return;
	const reason = rejectionReason(record, sponsor);
	if (reason) reject(record, registryKey, sponsor, request, reason, result);
	else PeerRecord.accept(record, registryKey, payloadKey, sponsor, request, result);
}

function duplicateRequest(record, registryKey, request, result) {
	const previous = record.spawnRegistry[registryKey];
	if (!previous) return false;
	result.duplicates.push({
		requestKey: request.key,
		childAgentId: previous.childAgentId || null,
		status: previous.status
	});
	return true;
}

function duplicatePayload(record, registryKey, payloadKey, sponsor, request, result) {
	const previous = record.spawnPayloadRegistry[payloadKey];
	if (!previous) return false;
	record.spawnRegistry[registryKey] = PeerRecord.registry(
		"duplicate_payload",
		sponsor,
		request,
		{
			childAgentId: previous.childAgentId || null,
			duplicateOfRequestKey: previous.requestKey
		}
	);
	result.duplicates.push({
		requestKey: request.key,
		childAgentId: previous.childAgentId || null,
		status: "duplicate_payload"
	});
	return true;
}

function rejectionReason(record, sponsor) {
	const policy = record.plan?.subagentPolicy || {};
	const maximumPeers = Request.bounded(
		policy.maxSubagentsPerAgent ?? policy.maxHelpersPerAgent,
		32,
		1,
		96
	);
	const maximumTotal = Request.bounded(policy.maxTotalWebsiteAgents, 256, 3, 512);
	if (policy.allowRecursiveSubagents === false) return "recursive_subagents_disabled";
	if (sponsor.childAgentIds.length >= maximumPeers) return "maximum_children_for_parent_reached";
	if (record.agents.length >= maximumTotal) return "maximum_total_website_agents_reached";
	return "";
}

function reject(record, registryKey, sponsor, request, reason, result) {
	record.spawnRegistry[registryKey] = PeerRecord.registry(
		"rejected",
		sponsor,
		request,
		{ reason }
	);
	result.rejected.push({ requestKey: request.key, reason });
	record.events.push(PeerRecord.event(
		"subagent_spawn_rejected",
		sponsor,
		request,
		{ reason }
	));
}

module.exports = { admitOne, rejectionReason };
