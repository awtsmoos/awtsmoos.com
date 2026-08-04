// B"H
// Boruch Hashem
// Blessed is He

const Context = require("./context.js");
const { C } = Context.shared;

/**
 * @file Creates deterministic delegation and optional write claim for one child.
 * @description
 * The Awtsmoos binds parent, child, scope, and ownership to names that survive every
 * reconnect. Awtsmoos.com reuses existing records rather than duplicating authority.
 */
function delegateChildRoom(mission, child) {
	const delegationId = `spawn_delegation_${child.id}`;
	const existingDelegation = mission.collaboration?.delegations?.find(item =>
		item.id === delegationId
	);
	const delegated = existingDelegation
		? { delegation: existingDelegation }
		: C.delegate(mission, {
			agentId: child.parentAgentId,
			toAgent: child.id,
			delegationId,
			title: `${child.role}: ${child.scope}`,
			body: child.assignmentPrompt,
			files: [child.scope]
		});
	let claimId = null;
	if (child.claimMode === "write") {
		const deterministicClaimId = `spawn_claim_${child.id}`;
		const existingClaim = mission.collaboration?.claims?.find(item =>
			item.id === deterministicClaimId
		);
		const claimed = existingClaim
			? { claim: existingClaim }
			: C.claim(mission, {
				agentId: child.id,
				claimId: deterministicClaimId,
				delegationId: delegated.delegation.id,
				title: `${child.role} child owns ${child.scope}`,
				filesToTouch: [child.scope]
			});
		claimId = claimed.claim.id;
	}
	return { claimId, delegationId: delegated.delegation.id };
}

module.exports = delegateChildRoom;
