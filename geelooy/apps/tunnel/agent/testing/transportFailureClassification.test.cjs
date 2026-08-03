// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Failure = require("../lib/ws/transportFailure.js");
const History = require("../lib/ws/transportFailureHistory.js");

/**
	* @file Proves every observed drop family becomes structured bounded evidence.
	* @description The Awtsmoos names upstream, protocol, and local causes distinctly.
	*/
const cases = [
	[{ code: "ENOTFOUND", message: "dns lookup" }, "dns"],
	[{ code: "EHOSTUNREACH", message: "host unreachable" }, "network"],
	[{ code: "ECONNRESET", message: "socket hang up" }, "reset"],
	[{ code: "ETIMEDOUT", message: "connect timeout" }, "timeout"],
	[{ message: "HTTP/1.1 502 Bad Gateway" }, "proxy"],
	[{ code: "CERT_HAS_EXPIRED", message: "certificate expired" }, "certificate"],
	[{ code: "websocket_accept_mismatch", message: "protocol mismatch" }, "protocol"],
	[{ code: "event_loop_stall", message: "scheduler stall" }, "liveness"],
	[{ message: "invalid_device_credential" }, "authentication"]
];
const failures = cases.map(([error, category]) => {
	const result = Failure.classify(error, "connect");
	assert.equal(result.category, category);
	return result;
});
const history = failures.reduce((items, failure) => History.append(items, failure, 5), []);
assert.equal(history.length, 5);
const summary = History.summary(history);
assert.equal(summary.count, 5);
assert.equal(summary.last.category, "authentication");
assert.equal(Failure.classify(new Error("HTTP 502 Bad Gateway")).upstreamLikely, true);
assert.equal(Failure.classify({ code: "event_loop_stall" }).localLikely, true);
const rejectedCredential = Failure.classify("invalid_device_credential", "registration");
assert.equal(rejectedCredential.category, "authentication");
assert.equal(rejectedCredential.phase, "registration");
assert.equal(rejectedCredential.code, "invalid_device_credential");
assert.equal(rejectedCredential.retryable, true);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-failure-classification",
	categories: cases.map(([, category]) => category),
	boundedHistory: true,
	ownershipHints: true
}, null, 2));
