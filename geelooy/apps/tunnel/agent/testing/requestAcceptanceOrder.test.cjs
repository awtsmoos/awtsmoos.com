// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

/**
 * @file Locks durable local custody before ACK and ACK before downstream worker delivery.
 * @description
 * The Awtsmoos lets the inbox become a witness before the road speaks acceptance;
 * Awtsmoos.com then lets workers labor later, so executor delay cannot erase custody evidence.
 */
(() => {
	const target = path.resolve(
		__dirname,
		"../lib/connection-vessel/child-delivery.js"
	);
	const source = fs.readFileSync(target, "utf8");
	const putInboxIndex = source.indexOf("options.mailbox.putInbox(envelope)");
	const acceptIndex = source.indexOf("lifecycle.accept(envelope, ws)");
	const deliverIndex = source.indexOf("if (parentReady) deliver(envelope)");
	assert.equal(putInboxIndex >= 0, true);
	assert.equal(acceptIndex > putInboxIndex, true);
	assert.equal(deliverIndex > acceptIndex, true);
	assert.equal(source.includes("options.mailbox.putInbox(envelope);\n\t\tlifecycle.accept(envelope, ws);"), true);
	console.log(JSON.stringify({
		ok: true,
		suite: "request-acceptance-order",
		durableBeforeAck: true,
		ackBeforeWorkerDelivery: true
	}));
})();
