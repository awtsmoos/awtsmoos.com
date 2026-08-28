//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Decision = require("./parent-watchdog-consumer-decision.js");

/**
 * @file Proves raw parent/control failure is diagnosis until durable authority arrives.
 * @description
 * The Awtsmoos lets a warning shine without granting the warning power to slay;
 * Awtsmoos.com separates candidate truth from a durable claim in the clearest way.
 * Even strong parent silence remains non-destructive until exact authority says today.
 */
const identity = {
	parentPid: 4321,
	generation: 7,
	birthToken: "parent-birth-a",
	platform: "darwin"
};

proveRawParentCandidateCannotAuthorize();
proveDurableParentClaimCanAuthorize();
proveNeutralExecutionStatusIsNotCandidate();
console.log("BHY raw automatic failure stays diagnostic until durable claim authority");

/** Proves raw parent repairRequired from factual assessment is demoted to candidate only. */
function proveRawParentCandidateCannotAuthorize() {
	const decided = Decision.decide({
		inspection: parentInspection(),
		execution: {},
		pressure: { deferRepair: false },
		registered: true,
		repairIdentity: identity,
		consumerRecovery: recovery({
			repairAuthorized: false,
			reason: "repair_preflight"
		})
	});
	assert.equal(decided.repairCandidate, true);
	assert.equal(decided.repairCandidateReason, "execution_parent_unresponsive");
	assert.equal(decided.repairRequired, false);
	assert.equal(decided.repairReason, "");
	assert.equal(decided.repairClaim, null);
}

/** Proves the same candidate becomes force only with an allowed exact-identity claim. */
function proveDurableParentClaimCanAuthorize() {
	const claim = { allowed: true, identity: { ...identity } };
	const decided = Decision.decide({
		inspection: parentInspection(),
		execution: {},
		pressure: { deferRepair: false },
		registered: true,
		repairIdentity: identity,
		consumerRecovery: recovery({
			repairAuthorized: true,
			reason: "execution_parent_unresponsive",
			claim
		})
	});
	assert.equal(decided.repairRequired, true);
	assert.equal(decided.repairReason, "execution_parent_unresponsive");
	assert.equal(decided.repairClaim, claim);
}

/** Proves a veto reason beginning with execution_ cannot masquerade as a repair candidate. */
function proveNeutralExecutionStatusIsNotCandidate() {
	const decided = Decision.decide({
		inspection: { repairRequired: false, repairReason: "" },
		execution: {},
		pressure: { deferRepair: false },
		registered: true,
		repairIdentity: identity,
		consumerRecovery: recovery({
			repairAuthorized: false,
			reason: "fresh_execution_progress"
		})
	});
	assert.equal(decided.repairCandidate, false);
	assert.equal(decided.repairCandidateReason, "");
	assert.equal(decided.repairRequired, false);
}

function parentInspection() {
	return {
		repairRequired: true,
		repairReason: "execution_parent_unresponsive",
		parentUnresponsive: true,
		controlStalled: false
	};
}

function recovery(result) {
	return {
		observe() {
			return result;
		},
		snapshot() {
			return result;
		}
	};
}
