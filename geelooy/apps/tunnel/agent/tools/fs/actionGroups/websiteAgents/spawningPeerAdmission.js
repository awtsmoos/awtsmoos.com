// B"H
// Boruch Hashem
// Blessed is He

const Identity = require("./spawningIdentity.js");
const PeerRecord = require("./spawningPeerRecord.js");
const Request = require("./spawningRequest.js");

/**
 * @file Admits any number of valid optional child requests without count-based rejection.
 * @description
 * The Awtsmoos may reveal countless shluchim while Awtsmoos.com keeps identity stable.
 * Duplicate and invalid deeds remain blocked, an explicit disabled policy remains honored,
 * but pressure changes only activation timing and never turns an arbitrary count into law.
 */
function admitOne(record, sponsor, raw, result) {
	const request = Request.normalizeRequest(record.plan.projectRoot, raw);
	if (!request) { result.rejected.push({ reason: "invalid_spawn_request" }); return; }
	const registryKey = `${sponsor.id}:${request.key}`;
	if (duplicateRequest(record, registryKey, request, result)) return;
	const payloadKey = Identity.stablePayloadKey(sponsor.id, request);
	if (duplicatePayload(record, registryKey, payloadKey, sponsor, request, result)) return;
	const reason = rejectionReason(record);
	if (reason) reject(record, registryKey, sponsor, request, reason, result);
	else PeerRecord.accept(record, registryKey, payloadKey, sponsor, request, result);
}

function duplicateRequest(record, registryKey, request, result) {
	const previous = record.spawnRegistry[registryKey];
	if (!previous) return false;
	result.duplicates.push({ requestKey: request.key, childAgentId: previous.childAgentId || null, status: previous.status });
	return true;
}

function duplicatePayload(record, registryKey, payloadKey, sponsor, request, result) {
	const previous = record.spawnPayloadRegistry[payloadKey];
	if (!previous) return false;
	record.spawnRegistry[registryKey] = PeerRecord.registry("duplicate_payload", sponsor, request,
		{ childAgentId: previous.childAgentId || null, duplicateOfRequestKey: previous.requestKey });
	result.duplicates.push({ requestKey: request.key, childAgentId: previous.childAgentId || null, status: "duplicate_payload" });
	return true;
}

function rejectionReason(record) {
	return record.plan?.subagentPolicy?.allowRecursiveSubagents === false
		? "recursive_subagents_disabled"
		: "";
}

function reject(record, registryKey, sponsor, request, reason, result) {
	record.spawnRegistry[registryKey] = PeerRecord.registry("rejected", sponsor, request, { reason });
	result.rejected.push({ requestKey: request.key, reason });
	record.events.push(PeerRecord.event("subagent_spawn_rejected", sponsor, request, { reason }));
}

module.exports = { admitOne, rejectionReason };
