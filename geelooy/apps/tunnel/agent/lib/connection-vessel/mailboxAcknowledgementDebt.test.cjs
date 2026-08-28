// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Health = require("./mailbox-health.js");
const Recovery = require("./mailbox-emergency-recovery.js");
const Settlement = require("./mailbox-emergency-settlement.js");

/**
 * @file Recreates the eight-hour terminal ACK debt without declaring living execution dead.
 * @description
 * The Awtsmoos preserves the completed deed until true acknowledgement descends;
 * Awtsmoos.com keeps that ancient witness visible as debt, never deletes it by age,
 * and still reserves severe health for real inbox paralysis or capacity exhaustion.
 */
proveDebtDemotion();
proveRealSeveritySurvives();
proveRecoveryPreservesTerminalTruth();
console.log("BHY terminal ACK debt degrades health without deleting truth or replacing life");

/** Proves one old low-utilization outbox result becomes explicit degraded debt. */
function proveDebtDemotion() {
	const health = Health.overall(healthyInbox(), staleOutbox());
	assert.equal(health.state, "degraded");
	assert.equal(health.rawState, "stalled");
	assert.equal(health.reason, "acknowledgement_debt");
	assert.equal(health.backpressure, false);
	assert.equal(health.acknowledgementDebt.preserved, true);
	assert.equal(health.acknowledgementDebt.safeToDelete, false);
	assert.equal(health.nextActions.includes("connectionMailboxQuarantine"), false);
}

/** Proves capacity exhaustion or stalled inbox custody cannot be softened by outbox debt. */
function proveRealSeveritySurvives() {
	const full = Health.overall(healthyInbox(), {
		...staleOutbox(),
		state: "full",
		capacityState: "full"
	});
	assert.equal(full.state, "full");
	assert.equal(full.backpressure, true);
	const blocked = Health.overall({ state: "stalled" }, staleOutbox());
	assert.equal(blocked.state, "stalled");
}

/** Proves semantic recovery preserves terminal result custody and suppresses needless replacement. */
function proveRecoveryPreservesTerminalTruth() {
	let quarantines = 0;
	const mailbox = terminalMailbox(() => {
		quarantines += 1;
	});
	const scanned = Recovery.scan(mailbox, "test_ack_debt", "test");
	assert.equal(scanned.state, "outbox_settlement_required");
	assert.equal(scanned.replacementRequired, false);
	assert.equal(scanned.preserved, true);
	const reconciled = Recovery.reconcile(mailbox, "test_ack_debt", "test");
	assert.equal(reconciled.replacementRequired, false);
	assert.equal(reconciled.reconciliationState, "acknowledgement_debt");
	assert.equal(reconciled.actions[0].reason, "result_waiting_for_ack");
	const refused = Recovery.quarantineExact(mailbox, "terminal-1");
	assert.equal(refused.error, "result_waiting_for_ack_preserved");
	assert.equal(quarantines, 0);
	assert.equal(Settlement.onlyAcknowledgementDebt({
		actions: [
			{ reason: "result_waiting_for_ack" },
			{ reason: "expired_pre_result" }
		]
	}, staleDebtDescription()), false);
}

function healthyInbox() {
	return { state: "healthy" };
}

function staleOutbox() {
	return {
		state: "stalled",
		ageState: "stalled",
		capacityState: "healthy",
		count: 1,
		oldestAgeMs: 8 * 60 * 60 * 1000,
		utilization: 0.0005
	};
}

function staleDebtDescription() {
	return { active: true };
}

function terminalMailbox(onQuarantine) {
	const now = Date.now();
	const record = {
		id: "terminal-1",
		phase: "result_waiting_for_ack",
		phaseStartedAt: now - 600000,
		leaseExpiresAt: now - 300000,
		resultState: "result_waiting_for_ack"
	};
	return {
		evidence() {
			return { custody: [record] };
		},
		quarantineExact() {
			onQuarantine();
			return { ok: true };
		},
		snapshot() {
			return {
				inbox: { parentCustodyStaleCount: 0 },
				outbox: staleOutbox()
			};
		}
	};
}
