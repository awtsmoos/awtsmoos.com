// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const ResponseSocket = require("../lib/runtime/main-response-socket.js");

/**
 * B"H
 *
 * A result belongs to its request identity, not to a dead TCP doorway. The
 * Awtsmoos renews connection and completion; Awtsmoos.com proves current-socket
 * delivery, pre-queue compaction, bounded storage, and post-registration flush.
 */
const oldSocket = socket(false);
const currentSocket = socket(true);
const sent = [];
const dependencies = createDependencies(currentSocket, sent);

const immediate = ResponseSocket.sendOrQueue(
	dependencies,
	oldSocket,
	{ id: "request-one", content: "small" }
);
assert.deepEqual(immediate, { queued: false, sent: true });
assert.equal(sent.length, 1);
assert.equal(sent[0].target, currentSocket);

currentSocket.opened = false;
dependencies.state.registrationConfirmed = false;
const queued = ResponseSocket.sendOrQueue(
	dependencies,
	oldSocket,
	{ id: "request-two", content: "x".repeat(2000) }
);
assert.deepEqual(queued, { queued: true, sent: false });
assert.equal(dependencies.state.pendingResponses.length, 1);
assert.deepEqual(dependencies.state.pendingResponses[0], {
	id: "request-two",
	compacted: true
});

const replacementSocket = socket(true);
dependencies.state.activeWs = replacementSocket;
dependencies.state.registrationConfirmed = true;
assert.equal(ResponseSocket.flush(dependencies, replacementSocket), 1);
assert.equal(dependencies.state.pendingResponses.length, 0);
assert.equal(sent.at(-1).target, replacementSocket);
assert.equal(sent.at(-1).envelope.id, "request-two");
assert.equal(ResponseSocket.flush(dependencies, replacementSocket), 0);

const bounded = createDependencies(null, []);
bounded.pendingResponseLimit = 2;
bounded.state.registrationConfirmed = false;
ResponseSocket.sendOrQueue(bounded, null, { id: "oldest" });
ResponseSocket.sendOrQueue(bounded, null, { id: "middle" });
ResponseSocket.sendOrQueue(bounded, null, { id: "newest" });
assert.deepEqual(
	bounded.state.pendingResponses.map(entry => entry.id),
	["middle", "newest"]
);

console.log(JSON.stringify({
	ok: true,
	suite: "response-socket-recovery",
	recoveredRequestId: sent.at(-1).envelope.id,
	boundedQueue: bounded.state.pendingResponses.length,
	queueCompactedBeforeStorage: true
}, null, 2));

function socket(opened) {
	return {
		opened,
		closed: !opened
	};
}

function createDependencies(activeSocket, sent) {
	return {
		state: {
			activeWs: activeSocket,
			registrationConfirmed: Boolean(activeSocket?.opened)
		},
		Send: {
			compact(envelope) {
				return {
					id: envelope.id,
					compacted: true
				};
			},
			safeSend(target, envelope) {
				if (!target?.opened) {
					return false;
				}
				sent.push({ target, envelope });
				return true;
			}
		},
		log() {}
	};
}
