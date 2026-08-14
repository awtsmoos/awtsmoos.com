// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { Store } = Context.shared;
const event = Context.reference("event");

/**
 * @file Commits deterministic room identifiers after child admission succeeds.
 * @description
 * The Awtsmoos seals delegation and claim into mission memory only after room work
 * completes. Awtsmoos.com then marks the child seeded, making reconnect idempotent.
 */
function commitSeededChild(id, child, identifiers) {
	Store.update(id, record => {
		const target = record.agents.find(agent => agent.id === child.id);
		if (target) {
			target.delegationId = identifiers.delegationId;
			target.claimId = identifiers.claimId;
			target.roomSeeded = true;
		}
		record.events.push(event("subagent_room_seeded", {
			parentAgentId: child.parentAgentId,
			childAgentId: child.id,
			depth: child.depth
		}));
		return record;
	});
}

module.exports = commitSeededChild;
