// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	allowedActionAlias,
	validateResponseGuard
} from "./requestGuard.js";

/**
 * @file Proves Tunnel Control accepts truthful shell-worker promotion.
 * @description
 * The Awtsmoos keeps the requested shell doorway visible while Awtsmoos.com moves
 * execution into a durable command vessel; unrelated actions remain quarantined.
 */
assert.equal(allowedActionAlias("shellCommand", "commandStart"), true);
assert.equal(allowedActionAlias("shellCommand", "commandRun"), true);
assert.equal(allowedActionAlias("shellCommand", "deleteTree"), false);

const promoted = validateResponseGuard({
	type: "TUNNEL_RESPONSE",
	requestAction: "commandStart",
	executionAction: "commandStart",
	actualAction: "commandStart",
	actionPromoted: true,
	clientRequestId: "client-shell",
	jobId: "job-shell"
}, {
	action: "shellCommand",
	clientRequestId: "client-shell"
});
assert.notEqual(promoted.ok, false);

const rejected = validateResponseGuard({
	type: "TUNNEL_RESPONSE",
	requestAction: "deleteTree",
	clientRequestId: "client-bad"
}, {
	action: "shellCommand",
	clientRequestId: "client-bad"
});
assert.equal(rejected.ok, false);
assert.equal(rejected.error, "tunnel_response_correlation_mismatch");

console.log(JSON.stringify({
	ok: true,
	suite: "request-guard-shell-promotion",
	truthfulPromotionAccepted: true,
	unrelatedActionRejected: true
}, null, 2));
