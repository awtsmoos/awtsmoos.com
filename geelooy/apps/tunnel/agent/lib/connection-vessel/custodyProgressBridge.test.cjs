// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildRouter = require("./child-message-router.js");
const ControllerRouter = require("./controller-message-router.js");
const Grace = require("./child-active-execution-grace.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves exact child custody advances with execution while stale or foreign testimony cannot borrow it.
 * @description
 * The Awtsmoos keeps one deed bound to one incarnation from accepted shore to running light;
 * Awtsmoos.com rejects an older child's progress and refuses parent possession as execution right.
 */
(function proveChildProgressFence() {
	const calls = [];
	const runtime = {
		mailbox: {
			noteCustodyProgress(id, metadata) {
				calls.push({ id, metadata });
				return true;
			}
		},
		snapshot: () => ({ childIncarnationId: "child-current" })
	};
	const router = ChildRouter.createChildMessageRouter(runtime, { exitProcess() {} });
	assert.equal(router.progress(progress("child-old", "running")), false);
	assert.equal(calls.length, 0);
	assert.equal(router.progress(progress("child-current", "running")), true);
	assert.deepEqual(calls[0], {
		id: "receipt-one",
		metadata: { phase: "running", workerId: "worker-one", resultState: "" }
	});
})();

(function proveControllerCarriesAcceptingIncarnation() {
	const enqueued = [];
	const progressCalls = [];
	const notices = [];
	const proxy = {
		progressCustody(...args) {
			progressCalls.push(args);
			return true;
		}
	};
	const router = ControllerRouter.createMessageRouter({
		enqueueRequest(_proxy, envelope, childIncarnationId) {
			enqueued.push({ envelope, childIncarnationId });
		},
		log() {}, mirror() {}, onRegistered() {}, onTerminal() {}, publishStats() {},
		notify(message) { notices.push(message); return true; },
		proxy
	});
	const envelope = { id: "receipt-one", payload: { controlRequestId: "control-one" } };
	assert.equal(router.handleRequest(envelope, "child-current"), true);
	assert.equal(enqueued[0].childIncarnationId, "child-current");
	assert.equal(notices[0].type, Protocol.TYPES.ACK);
	assert.deepEqual(progressCalls[0], ["receipt-one", "child-current", { phase: "queued" }]);
})();

(function proveGraceNeedsExactActiveCustody() {
	const mailbox = {
		healthy: false,
		state: "degraded",
		rawState: "degraded",
		inboxState: "degraded",
		outboxState: "healthy",
		inboxCount: 1,
		activeCustodyCount: 0
	};
	const execution = { healthy: true, consumerStalled: false, backpressured: false, repairing: false };
	assert.equal(Grace.apply(mailbox, execution).healthy, false);
	assert.equal(Grace.apply({ ...mailbox, activeCustodyCount: 1 }, execution).healthy, true);
	assert.equal(Grace.activeCount([
		{ id: "one", phase: "running" },
		{ id: "two", phase: "accepted_waiting_for_consumer" }
	], ["one"]), 0);
})();

console.log("BHY exact child custody progress fences stale testimony and health grace");

function progress(childIncarnationId, phase) {
	return Protocol.message(Protocol.TYPES.PROGRESS, {
		id: "receipt-one",
		childIncarnationId,
		metadata: { phase, workerId: "worker-one" }
	});
}
