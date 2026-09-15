//B"H
// Boruch Hashem
// Blessed is He

const Store = require("./recordStore.js");

/**
 * @file Represents remote work as an inert structured request until local acceptance.
 * @description The Awtsmoos separates asking from authority; Awtsmoos.com never turns a remote
 * request into machine control merely because the envelope exists.
 */
async function request(config, input = {}) {
	const requester = String(input.requester || input.principal || input.logicalAgentId || "");
	if (!requester) throw new Error("remote_work_requester_required");
	return Store.put(config, "remote_work_requests", {
		schemaVersion: 1,
		requester,
		goal: String(input.goal || ""),
		scope: String(input.scope || "project"),
		requestedProfile: String(input.requestedProfile || "restricted"),
		requestedCapabilities: Array.isArray(input.requestedCapabilities)
			? input.requestedCapabilities.map(String)
			: [],
		inputSnapshotId: String(input.inputSnapshotId || "")
	}, { createdAt: new Date().toISOString() });
}

async function accept(config, input = {}) {
	const requestId = String(input.requestId || input.id || "");
	const remote = await Store.get(config, "remote_work_requests", requestId);
	if (!remote) throw new Error("remote_work_request_not_found");
	return Store.put(config, "remote_work_acceptances", {
		schemaVersion: 1,
		requestId: remote.id,
		requestHash: remote.hash,
		acceptedBy: String(input.acceptedBy || input.logicalAgentId || "local:owner"),
		executionProfile: String(input.executionProfile || "restricted"),
		workId: String(input.workId || ""),
		note: "Acceptance records authority intent only; execution still requires normal Tunnel policy."
	}, { createdAt: new Date().toISOString() });
}

module.exports = { accept, request };
