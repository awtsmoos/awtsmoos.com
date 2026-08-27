// B"H

const assert = require("node:assert/strict");
const deserialize = require("./obj.js");

const original = console.warn;
const calls = [];
console.warn = (...argumentsList) => calls.push(argumentsList);
try {
	const malformed = Buffer.alloc(8 * 1024 * 1024, 0x7b);
	assert.equal(deserialize(malformed), null);
} finally {
	console.warn = original;
}

assert.equal(calls.length, 1);
const encoded = JSON.stringify(calls[0]);
assert.ok(encoded.length < 1000, `diagnostic was ${encoded.length} characters`);
assert.equal(calls[0][1].bytes, 8 * 1024 * 1024);
assert.ok(calls[0][1].preview.length <= 160);

console.log(JSON.stringify({
	ok: true,
	suite: "bounded-invalid-binary-json-logging",
	multiMegabyteBufferNotLogged: true
}, null, 2));
