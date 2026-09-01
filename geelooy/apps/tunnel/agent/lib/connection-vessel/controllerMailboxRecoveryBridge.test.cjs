// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const MessageRouter = require("./controller-message-router.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves only current-incarnation mailbox ambiguity can authorize exact-child recovery.
 * @description
 * The Awtsmoos preserves ambiguity as evidence, yet Awtsmoos.com grants repair authority
 * only to testimony whose source and state name the same living child incarnation.
 * Old testimony remains visible but cannot destroy the replacement that came after it.
 */
const events = [];
const router = MessageRouter.createMessageRouter({
	enqueueRequest() {},
	log() {},
	mirror(state) {
		events.push(["mirror", state.mailboxRecovery?.reason || "", state.childIncarnationId]);
	},
	notify: () => true,
	onRecoveryRequired(testimony) {
		events.push(["repair", testimony.reason, testimony.childIncarnationId]);
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
router.handle(stateMessage("child-current", "child-current", ambiguous));
assert.deepEqual(events.slice(-2), [
	["mirror", "semantic_recovery_ambiguous", "child-current"],
	["repair", "child_mailbox_semantic_recovery_ambiguous", "child-current"]
]);

const repairCount = events.filter(event => event[0] === "repair").length;
router.handle(stateMessage("child-current", "child-old", ambiguous));
assert.equal(events.filter(event => event[0] === "repair").length, repairCount);
assert.deepEqual(events.at(-1), [
	"mirror",
	"semantic_recovery_ambiguous",
	"child-current"
]);

const result = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "result_waiting_for_ack" }],
	expired: 1,
	observedAt: 2000,
	ok: false,
	replacementRequired: true
});
router.handle(stateMessage("child-current", "child-current", result));
assert.deepEqual(events.at(-1), [
	"repair",
	"child_mailbox_result_waiting_for_ack",
	"child-current"
]);

console.log("BHY only current-incarnation mailbox testimony can request child recovery");

function stateMessage(sourceIncarnation, stateIncarnation, mailboxRecovery) {
	return Protocol.message(Protocol.TYPES.STATE, {
		childIncarnationId: sourceIncarnation,
		state: {
			childIncarnationId: stateIncarnation,
			mailboxRecovery,
			registered: true
		}
	});
}
