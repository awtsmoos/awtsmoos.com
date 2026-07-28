// B"H

const assert = require("node:assert/strict");
const Delivery = require("../lib/connection-vessel/child-delivery.js");

const sent = [];
const scheduled = [];
const all = Array.from({ length: 1000 }, (_, index) => ({ id: `receipt-${index}` }));
const mailbox = {
	inbox: () => [],
	outbox: () => all,
	outboxOne: id => all.find(entry => entry.id === id) || null,
	putInbox() {}
};
const runtime = Delivery.createDelivery({
	Send: {
		safeSend(_socket, envelope) {
			sent.push(envelope.id);
			return true;
		}
	},
	mailbox,
	schedule: callback => scheduled.push(callback),
	send: () => true,
	state: {
		activeWs: { opened: true },
		registrationConfirmed: true
	}
});

assert.equal(runtime.flush("receipt-777"), 1);
assert.deepEqual(sent, ["receipt-777"]);
sent.length = 0;
assert.equal(runtime.flush(), 1000);
while (scheduled.length) scheduled.shift()();
assert.equal(sent.length, 1000);

console.log(JSON.stringify({
	ok: true,
	suite: "connection-mailbox-targeted-flush",
	backlog: all.length,
	perResponseSends: 1,
	reconnectStillFlushesAll: true,
	reconnectBatchSize: 8
}));
