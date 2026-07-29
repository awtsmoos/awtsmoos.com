// B"H

const assert = require("node:assert/strict");
const RemoteClose = require("../lib/ws/remoteClose.js");

const payload = Buffer.alloc(2 + Buffer.byteLength("service restart"));
payload.writeUInt16BE(1012, 0);
payload.write("service restart", 2);
const details = RemoteClose.decode(payload);
assert.deepEqual(details, { code: 1012, reason: "service restart", valid: true });
const failure = RemoteClose.failure(details);
assert.equal(failure.code, "websocket_remote_close_1012");
assert.match(failure.message, /service restart/);

assert.deepEqual(RemoteClose.decode(Buffer.alloc(0)), {
	code: 1005,
	reason: "",
	valid: true
});
assert.equal(RemoteClose.decode(Buffer.from([1])).valid, false);

console.log(JSON.stringify({
	ok: true,
	suite: "remote-websocket-close-reason",
	closeCodePreserved: true
}, null, 2));
