//B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const MessageRouter = require("./controller-message-router.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves preserved mailbox ambiguity becomes bounded exact-child recovery testimony.
 * @description
 * The Awtsmoos lets evidence cross process boundaries without turning age into permission.
 * Awtsmoos.com mirrors the child's preserved custody first, then asks the supervisor to repair
 * only the exact child generation while the accepted deed remains protected from redispatch.
 *
 * > Preserve what is known, repair what is bound,
 * > Let no stale lease erase what was found;
 * > The Awtsmoos renews every process around,
 * > While exact-child testimony keeps truth on the ground.
 */
const events = [];
const router = MessageRouter.createMessageRouter({
	enqueueRequest() {},
	log() {},
	mirror(state) {
		events.push(["mirror", state.mailboxRecovery?.reason || ""]);
	},
	notify() {
		return true;
	},
	onRecoveryRequired(reason) {
		events.push(["repair", reason]);
	},
	onRegistered() {},
	onTerminal() {},
	proxy: {},
	publishStats() {}
});

const ambiguous = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "accepted_execution_ambiguity" }],
	expired: 1,
	observedAt: 1000,
	ok: false,
	replacementRequired: true
});
assert.equal(ambiguous.reason, "semantic_recovery_ambiguous");
assert.equal(ambiguous.preserved, 1);
assert.equal(ambiguous.quarantined, 0);
assert.equal(ambiguous.replacementRequired, true);

router.handle(Protocol.message(Protocol.TYPES.STATE, {
	state: { mailboxRecovery: ambiguous, registered: true }
}));
assert.deepEqual(events, [
	["mirror", "semantic_recovery_ambiguous"],
	["repair", "child_mailbox_semantic_recovery_ambiguous"]
]);

const result = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "result_waiting_for_ack" }],
	expired: 1,
	observedAt: 2000,
	ok: false,
	replacementRequired: true
});
assert.equal(result.reason, "result_waiting_for_ack");
assert.equal(result.preserved, 1);

router.handle(Protocol.message(Protocol.TYPES.STATE, {
	state: { mailboxRecovery: result, registered: true }
}));
assert.deepEqual(events.slice(-2), [
	["mirror", "result_waiting_for_ack"],
	["repair", "child_mailbox_result_waiting_for_ack"]
]);

const healthy = RecoveryView.present({
	actions: [],
	expired: 0,
	observedAt: 3000,
	ok: true,
	replacementRequired: false
});
router.handle(Protocol.message(Protocol.TYPES.STATE, {
	state: { mailboxRecovery: healthy, registered: true }
}));
assert.deepEqual(events.slice(-1), [["mirror", "no_expired_custody"]]);

console.log("BHY preserved mailbox ambiguity mirrors before exact child recovery testimony");
