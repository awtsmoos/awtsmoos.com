// B"H
// Boruch Hashem
// Blessed is He

const Collaboration = require("./collaboration.js");
const Identity = require("./successorIdentity.js");

/**
 * @file Prepares exactly one room-only logical successor with deterministic work custody.
 * @description
 * The Awtsmoos wastes no ready messenger and invents no duplicate claim; Awtsmoos.com
 * reuses an idle peer when one waits, otherwise joins one deterministic successor, then
 * seals delegation and claim IDs from the terminal event so replay meets the same vessel.
 */
function prepareRoom(mission, predecessorId, terminalKey, work) {
	const room = Collaboration.ensure(mission);
	const existing = idlePeer(room, predecessorId);
	const successor = existing || Collaboration.join(mission, {
		agentId: Identity.successorId(mission.id, terminalKey),
		agentName: `${room.agents[predecessorId]?.name || predecessorId} successor`,
		role: room.agents[predecessorId]?.role || "successor",
		capabilities: room.agents[predecessorId]?.capabilities || []
	}).agent;
	const delegationId = Identity.delegationId(terminalKey);
	const claimId = Identity.claimId(terminalKey);
	if (!room.delegations.some(item => item.id === delegationId)) {
		Collaboration.delegate(mission, {
			agentId: predecessorId,
			toAgent: successor.agentId,
			delegationId,
			title: "Automatic successor continuation",
			details: JSON.stringify(work)
		});
	}
	if (!room.claims.some(item => item.id === claimId)) {
		Collaboration.claim(mission, {
			agentId: successor.agentId,
			delegationId,
			claimId,
			title: "Automatic successor continuation"
		});
	}
	return {
		successorId: successor.agentId,
		reused: Boolean(existing),
		delegationId,
		claimId
	};
}

function idlePeer(room, predecessorId) {
	const blocked = new Set([
		"complete", "completed", "failed", "cancelled", "blocked", "quarantined"
	]);
	return Object.values(room.agents || {}).find(agent =>
		agent?.agentId && agent.agentId !== predecessorId &&
		!blocked.has(String(agent.status || "").toLowerCase()) &&
		!hasActiveWork(room, agent.agentId)
	) || null;
}

function hasActiveWork(room, agentId) {
	const claimed = (room.claims || []).some(item =>
		item.agentId === agentId && ["active", "conflict"].includes(item.status)
	);
	const delegated = (room.delegations || []).some(item =>
		item.claimedBy === agentId &&
		!["done", "blocked", "cancelled"].includes(item.status)
	);
	return claimed || delegated;
}

module.exports = {
	hasActiveWork,
	idlePeer,
	prepareRoom
};
