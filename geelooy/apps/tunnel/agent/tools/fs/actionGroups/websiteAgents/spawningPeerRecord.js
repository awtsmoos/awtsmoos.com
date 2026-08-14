// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./store.js");
const Identity = require("./spawningIdentity.js");

/** Commits one accepted flat peer and its sponsor-scoped durable witnesses. */
function accept(record, registryKey, payloadKey, sponsor, request, result) {
	const peerId = Identity.stableChildId(record.id, sponsor.id, request.key, request.role);
	const peer = Store.agentState(record.id, {
		id: peerId,
		name: Identity.peerName(request.role, sponsor.childAgentIds.length + 1),
		role: request.role,
		focus: request.prompt,
		claimMode: "write",
		scope: request.scope,
		ordinal: record.agents.length + 1,
		parentAgentId: sponsor.id,
		sponsorAgentId: sponsor.id,
		topology: "flat-peer",
		isSpawnedAgent: true,
		depth: 0,
		rootAgentId: peerId,
		spawnRequestKey: request.key,
		assignmentPrompt: request.prompt,
		spawnPrompt: request.prompt,
		singleUse: true,
		roomSeeded: false
	});
	record.agents.push(peer);
	sponsor.childAgentIds.push(peer.id);
	sponsor.spawnedChildCount = sponsor.childAgentIds.length;
	record.spawnRegistry[registryKey] = registry("accepted", sponsor, request, {
		childAgentId: peer.id,
		request
	});
	record.spawnPayloadRegistry[payloadKey] = registry("accepted", sponsor, request, {
		childAgentId: peer.id
	});
	record.events.push(event("subagent_spawn_admitted", sponsor, request, {
		childAgentId: peer.id,
		depth: 0,
		topology: "flat-peer"
	}));
	result.accepted.push({
		requestKey: request.key,
		parentAgentId: sponsor.id,
		sponsorAgentId: sponsor.id,
		childAgentId: peer.id,
		depth: 0,
		topology: "flat-peer",
		role: peer.role,
		scope: peer.scope,
		prompt: peer.assignmentPrompt
	});
}

function registry(status, sponsor, request, details = {}) {
	return {
		status,
		parentAgentId: sponsor.id,
		sponsorAgentId: sponsor.id,
		requestKey: request.key,
		at: now(),
		...details
	};
}

function event(type, sponsor, request, details = {}) {
	return {
		at: now(),
		type,
		parentAgentId: sponsor.id,
		sponsorAgentId: sponsor.id,
		requestKey: request.key,
		...details
	};
}

function now() {
	return new Date().toISOString();
}

module.exports = { accept, event, registry };
