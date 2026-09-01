// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const RecoveryView = require("./child-mailbox-recovery-view.js");
const MessageRouter = require("./controller-message-router.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves mailbox age is visible attention while explicit current-incarnation repair stays fenced.
 * @description
 * The Awtsmoos preserves ambiguity as evidence without granting an old clock destructive power.
 * Awtsmoos.com mirrors current attention to the parent, yet only explicit replacement testimony
 * from the exact living incarnation may cross the final repair boundary and touch the messenger.
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

const attention = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "accepted_execution_ambiguity" }],
	attentionRequired: true,
	expired: 1,
	observedAt: 1000,
	ok: true,
	replacementRequired: false
});
router.handle(stateMessage("child-current", "child-current", attention));
assert.deepEqual(events.at(-1), ["mirror", "semantic_attention_required", "child-current"]);
assert.equal(events.some(event => event[0] === "repair"), false);

const resultAttention = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "result_waiting_for_ack" }],
	attentionRequired: true,
	expired: 1,
	observedAt: 2000,
	ok: true,
	replacementRequired: false
});
router.handle(stateMessage("child-current", "child-current", resultAttention));
assert.deepEqual(events.at(-1), ["mirror", "result_waiting_for_ack_attention", "child-current"]);
assert.equal(events.some(event => event[0] === "repair"), false);

const explicitRepair = RecoveryView.present({
	actions: [{ operation: "preserved", reason: "accepted_execution_ambiguity" }],
	expired: 1,
	observedAt: 3000,
	ok: false,
	replacementRequired: true
});
router.handle(stateMessage("child-current", "child-current", explicitRepair));
assert.deepEqual(events.at(-1), [
	"repair",
	"child_mailbox_semantic_recovery_ambiguous",
	"child-current"
]);

const repairCount = events.filter(event => event[0] === "repair").length;
router.handle(stateMessage("child-current", "child-old", explicitRepair));
assert.equal(events.filter(event => event[0] === "repair").length, repairCount);

console.log("BHY mailbox attention cannot repair a child while explicit current testimony remains fenced");

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
