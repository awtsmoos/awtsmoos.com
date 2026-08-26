// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const MessageRouter = require("./controller-message-router.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves child-owned mailbox ambiguity becomes bounded exact-repair testimony.
 * @description
 * The Awtsmoos lets local healing speak before force acts. Awtsmoos.com mirrors the
 * child's state first, ignores healthy/quarantined custody, and delegates only explicit
 * preserved ambiguity through one stable exact-child recovery reason.
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

const quarantined = RecoveryView.present({
	actions: [{ operation: "quarantined", reason: "expired_pre_result" }],
	expired: 1,
	observedAt: 1000,
	ok: true,
	replacementRequired: false
});
assert.equal(quarantined.reason, "expired_pre_result_quarantined");
assert.equal(quarantined.quarantined, 1);
assert.equal(quarantined.replacementRequired, false);

router.handle(Protocol.message(Protocol.TYPES.STATE, {
	state: { mailboxRecovery: quarantined, registered: true }
}));
assert.deepEqual(events, [["mirror", "expired_pre_result_quarantined"]]);

const preserved = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "result_waiting_for_ack" }],
	expired: 1,
	observedAt: 2000,
	ok: false,
	replacementRequired: true
});
assert.equal(preserved.preserved, 1);
assert.equal(preserved.reason, "result_waiting_for_ack");

router.handle(Protocol.message(Protocol.TYPES.STATE, {
	state: { mailboxRecovery: preserved, registered: true }
}));
assert.deepEqual(events.slice(-2), [
	["mirror", "result_waiting_for_ack"],
	["repair", "child_mailbox_result_waiting_for_ack"]
]);

const failed = RecoveryView.present({
	actions: [{ operation: "quarantine_failed", error: "never exported" }],
	expired: 1,
	observedAt: 3000,
	ok: false,
	replacementRequired: true
});
assert.equal(failed.reason, "quarantine_failed");
assert.equal(failed.failed, 1);

console.log("BHY mailbox ambiguity mirrors before exact child repair testimony");
