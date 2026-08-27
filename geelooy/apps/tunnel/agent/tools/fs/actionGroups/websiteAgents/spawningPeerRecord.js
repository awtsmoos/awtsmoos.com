// B"H
// Boruch Hashem
// Blessed is He

const Store = require("./store.js");
const Identity = require("./spawningIdentity.js");

/**
 * @file Commits one accepted flat peer with inherited sibling group and generation lineage.
 * @description
 * The Awtsmoos lets a sponsor reveal many helpers without losing the thread between
 * them. Awtsmoos.com inherits the sponsor's group unless explicitly supplied, then
 * records predecessor and generation while browser work stays flat and physically bounded.
 */
function accept(record, registryKey, payloadKey, sponsor, request, result) {
	const peerId = Identity.stableChildId(record.id, sponsor.id, request.key, request.role);
	const spawnGroupId = Identity.stableSpawnGroupId(
		record.missionId || record.id,
		sponsor.id,
		request.spawnGroupId || sponsor.spawnGroupId
	);
	const generation = positive(request.generation, Number(sponsor.generation || 1));
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
		spawnGroupId,
		generation,
		predecessorAgentId: String(request.predecessorAgentId || ""),
		topology: "flat-peer",
		isSpawnedAgent: true,
		depth: 0,
		rootAgentId: peerId,
		spawnRequestKey: request.key,
		assignmentPrompt: request.prompt,
		spawnPrompt: request.prompt,
		handoffPaths: request.handoffPaths || [],
		singleUse: true,
		roomSeeded: false
	});
	record.agents.push(peer);
	sponsor.childAgentIds.push(peer.id);
	sponsor.spawnedChildCount = sponsor.childAgentIds.length;
	const details = {
		childAgentId: peer.id,
		spawnGroupId,
		generation,
		predecessorAgentId: peer.predecessorAgentId || null
	};
	record.spawnRegistry[registryKey] = registry("accepted", sponsor, request, {
		...details,
		request
	});
	record.spawnPayloadRegistry[payloadKey] = registry("accepted", sponsor, request, details);
	record.events.push(event("subagent_spawn_admitted", sponsor, request, {
		...details,
		depth: 0,
		topology: "flat-peer"
	}));
	result.accepted.push({
		requestKey: request.key,
		parentAgentId: sponsor.id,
		sponsorAgentId: sponsor.id,
		...details,
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

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? Math.floor(number) : fallback;
}

function now() {
	return new Date().toISOString();
}

module.exports = { accept, event, registry };
