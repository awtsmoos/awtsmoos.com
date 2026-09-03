// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ChildRouter = require("./child-message-router.js");
const ChildCustody = require("./child-runtime-custody.js");
const ControllerRouter = require("./controller-message-router.js");
const Grace = require("./child-active-execution-grace.js");
const Protocol = require("./protocol.js");

/**
 * @file Proves exact custody progress across modern child and parent bridges.
 * @description
 * The Awtsmoos binds one deed to its generation, session, and incarnation in light;
 * Awtsmoos.com carries that exact testimony forward, while stale shadows lose their right.
 */
(function proveChildProgressFence() {
	const calls = [];
	const identity = exactIdentity();
	const mailbox = {
		noteCustodyProgress(id, metadata) {
			calls.push({ id, metadata });
			return true;
		},
		snapshot() {
			return { inbox: { parentCustodyRecords: [{ id: "receipt-one", phase: "queued", ...identity }] } };
		}
	};
	const custody = ChildCustody.createCustody({
		mailbox,
		parent: { noteCustody: () => true },
		state: { generation: 7, childIncarnationId: "child-current" }
	});
	const runtime = { noteCustodyProgress: custody.noteCustodyProgress };
	const router = ChildRouter.createChildMessageRouter(runtime, { exitProcess() {} });
	assert.equal(router.progress(progress("child-old", "running", identity)), false);
	assert.equal(calls.length, 0);
	assert.equal(router.progress(progress("child-current", "running", identity)), true);
	assert.equal(calls[0].id, "receipt-one");
	assert.equal(calls[0].metadata.phase, "running");
	assert.equal(calls[0].metadata.generation, 7);
})();

(function proveControllerCarriesExactCustody() {
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
		generation: () => 7,
		log() {},
		mirror() {},
		onRegistered() {},
		onTerminal() {},
		publishStats() {},
		notify(message) {
			notices.push(message);
			return true;
		},
		proxy
	});
	const envelope = { id: "receipt-one", payload: { controlRequestId: "control-one" } };
	assert.equal(router.handleRequest(envelope, "child-current"), true);
	assert.equal(enqueued[0].childIncarnationId, "child-current");
	assert.equal(enqueued[0].envelope.connectionCustody.generation, 7);
	assert.equal(enqueued[0].envelope.connectionCustody.childIncarnationId, "child-current");
	assert.equal(notices[0].type, Protocol.TYPES.ACK);
	assert.equal(notices[0].generation, 7);
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
})();

console.log("BHY exact child custody carries generation and fences stale testimony");

function exactIdentity() {
	return {
		requestId: "request-one",
		requestKey: "request-one",
		logicalAgentId: "agent-one",
		agentSessionId: "session-one",
		controlRequestId: "control-one",
		transportReceiptId: "receipt-one",
		generation: 7,
		childIncarnationId: "child-current"
	};
}

function progress(childIncarnationId, phase, identity) {
	return Protocol.message(Protocol.TYPES.CUSTODY_PROGRESS, {
		...identity,
		id: "receipt-one",
		childIncarnationId,
		phase,
		workerId: "worker-one"
	});
}
