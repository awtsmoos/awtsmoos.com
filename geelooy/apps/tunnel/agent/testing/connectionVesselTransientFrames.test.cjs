// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");
const Protocol = require("../lib/connection-vessel/protocol.js");
const Proxy = require("../lib/connection-vessel/proxy.js");

/**
 * @file Proves progress never becomes durable terminal-response backlog.
 * @description The Awtsmoos persists accepted work and final answers while
 * progress and request acceptance cross the independent socket exactly once.
 */
const ipc = [];
const outbox = [];
const proxy = Proxy.createProxy({
	mailbox: {
		putOutbox(envelope) {
			outbox.push(envelope);
			return envelope;
		}
	},
	notify(message) {
		ipc.push(message);
		return true;
	}
});
proxy.update({ connected: true, registered: true, running: true });
assert.equal(proxy.sendJson({ type: "TUNNEL_PROGRESS", id: "progress-one" }), true);
assert.equal(outbox.length, 0);
assert.equal(ipc[0].type, Protocol.TYPES.SEND);
assert.equal(ipc[0].envelope.type, "TUNNEL_PROGRESS");
proxy.durableSend({ type: "TUNNEL_RESPONSE", id: "answer-one" });
assert.equal(outbox.length, 1);
assert.equal(ipc[1].type, Protocol.TYPES.FLUSH);

const socketFrames = [];
const parentFrames = [];
const inbox = [];
const delivery = Delivery.createDelivery({
	Send: {
		safeSend(_socket, envelope) {
			socketFrames.push(envelope);
			return true;
		}
	},
	mailbox: {
		inbox: () => [...inbox],
		outbox: () => [],
		putInbox(envelope) {
			inbox.push(envelope);
		}
	},
	send(message) {
		parentFrames.push(message);
		return true;
	},
	state: {
		activeWs: { opened: true },
		registrationConfirmed: true
	}
});
delivery.parentDidBecomeReady();
delivery.enqueueRequest({ opened: true }, {
	type: "TUNNEL_REQUEST",
	id: "request-one"
});
assert.equal(inbox.length, 1);
assert.equal(socketFrames[0].type, "TUNNEL_REQUEST_ACK");
assert.equal(socketFrames[0].durable, true);
assert.equal(parentFrames[0].type, Protocol.TYPES.REQUEST);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-vessel-transient-frames",
	progressNotPersisted: true,
	terminalResponsePersisted: true,
	requestDurabilityAcknowledged: true
}, null, 2));
