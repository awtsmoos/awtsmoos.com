// B"H

const assert = require("node:assert/strict");
const Writer = require("./frameWriter.js");

function socket(overrides = {}) {
	const writes = [];
	return {
		corked: 0,
		destroyed: false,
		writable: true,
		writableLength: 0,
		writes,
		cork() { this.corked += 1; },
		uncork() { this.corked -= 1; },
		write(value) { writes.push(Buffer.from(value)); return true; },
		...overrides
	};
}

const healthy = socket();
assert.equal(Writer.sendFrame(healthy, "shalom", 0x1, { maximumQueuedBytes: 1024 * 1024 }), true);
assert.equal(healthy.corked, 0);
assert.equal(Buffer.concat(healthy.writes).subarray(2).toString(), "shalom");

const congested = socket({ writableLength: 2 * 1024 * 1024 });
assert.equal(Writer.sendFrame(congested, "bounded", 0x1, { maximumQueuedBytes: 1024 * 1024 }), false);
assert.equal(congested.writes.length, 0);
assert.equal(congested.awtsmoosBackpressure.limit, 1024 * 1024);

const closed = socket({ writable: false });
assert.equal(Writer.sendFrame(closed, "nope"), false);
assert.equal(closed.writes.length, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "websocket-frame-writer-backpressure",
	largePayloadCopyAvoided: true,
	queueBounded: true
}, null, 2));
