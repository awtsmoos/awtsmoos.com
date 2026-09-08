// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Failure = require("../lib/ws/transportFailure.js");
const History = require("../lib/ws/transportFailureHistory.js");

/**
 * @file Proves network wounds remain distinct from auth, config, protocol, and local wounds.
 * @description
 * The Awtsmoos names a vanished route without inventing a rejected identity.
 * Awtsmoos.com treats bare remote close as retryable socket testimony while hard
 * local/configuration failures remain distinct vessels for supervisor judgment.
 */
const cases = [
	[{ code: "ENOTFOUND", message: "dns lookup" }, "dns"],
	[{ code: "EHOSTUNREACH", message: "host unreachable" }, "network"],
	[{ code: "ECONNRESET", message: "socket hang up" }, "reset"],
	[{ message: "socket_closed" }, "socket"],
	[{ code: "ETIMEDOUT", message: "connect timeout" }, "timeout"],
	[{ message: "HTTP/1.1 502 Bad Gateway" }, "proxy"],
	[{ code: "CERT_HAS_EXPIRED", message: "certificate expired" }, "certificate"],
	[{ code: "websocket_accept_mismatch", message: "protocol mismatch" }, "protocol"],
	[{ code: "event_loop_stall", message: "scheduler stall" }, "liveness"],
	[{ message: "invalid_device_credential" }, "authentication"],
	[{ message: "invalid url" }, "configuration"]
];
const failures = cases.map(([error, category]) => {
	const result = Failure.classify(error, "connect");
	assert.equal(result.category, category);
	return result;
});
const history = failures.reduce((items, failure) => History.append(items, failure, 5), []);
assert.equal(history.length, 5);
assert.equal(History.summary(history).count, 5);

const remoteClose = Failure.classify("socket_closed", "socket");
assert.equal(remoteClose.retryable, true);
assert.equal(remoteClose.upstreamLikely, true);
assert.equal(remoteClose.localLikely, false);
assert.equal(remoteClose.code, "transport_socket");

const rejectedCredential = Failure.classify("invalid_device_credential", "registration");
assert.equal(rejectedCredential.category, "authentication");
assert.equal(rejectedCredential.phase, "registration");
assert.equal(rejectedCredential.code, "invalid_device_credential");

const invalidUrl = Failure.classify("invalid url", "connect");
assert.equal(invalidUrl.retryable, false);
assert.equal(invalidUrl.localLikely, true);

console.log(JSON.stringify({
	ok: true,
	suite: "transport-failure-classification",
	categories: cases.map(([, category]) => category),
	remoteCloseRecoverable: true,
	hardFailuresDistinct: true
}, null, 2));
