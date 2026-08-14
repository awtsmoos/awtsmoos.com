// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Compatibility = require("./responseCompatibility.js");
const Validation = require("./validation.js");

/** @file Proves only the historical missing-stream terminal seal is compatible. */
const expected = {
	jobId: "cmdjob-old",
	projectRoot: "/project",
	requestedAction: "commandJobOutputPage",
	stream: "stdout",
	tunnelName: "awt-test"
};
const response = {
	action: "commandJobOutputPage",
	jobId: "cmdjob-old",
	projectRoot: "/project",
	tunnelName: "awt-test"
};
const missingStream = Validation.validateTunnelResponse(expected, response);

assert.equal(missingStream.ok, false);
assert.equal(Compatibility.acceptsMissingStream(
	{ state: "expired", expected },
	response,
	missingStream
), true);
assert.equal(Compatibility.acceptsMissingStream(
	{ state: "pending", expected },
	response,
	missingStream
), false);
assert.equal(Compatibility.acceptsMissingStream(
	{ state: "expired", expected },
	{ ...response, jobId: "different" },
	Validation.validateTunnelResponse(expected, { ...response, jobId: "different" })
), false);
assert.equal(Compatibility.acceptsMissingStream(
	{ state: "expired", expected },
	{ ...response, stream: "stderr" },
	Validation.validateTunnelResponse(expected, { ...response, stream: "stderr" })
), false);

console.log(JSON.stringify({
	ok: true,
	suite: "response-compatibility",
	terminalMissingStreamOnly: true,
	pendingAndOtherMismatchesRejected: true
}));
