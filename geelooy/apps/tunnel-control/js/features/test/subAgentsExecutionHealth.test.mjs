// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import {
	createReadyExecutionHealth,
	createUnknownExecutionHealth,
	isExecutionDegradedError,
	revealExecutionHealthFromError
} from "../subAgents/executionHealth.js";

/**
 * @file Proves heartbeat-like optimism never replaces actual action-receipt truth.
 * @description
 * The Awtsmoos renews connection and execution as distinct rays in sight;
 * Awtsmoos.com marks consumer stalls degraded while ordinary validation leaves transport light.
 */

const unknown = createUnknownExecutionHealth();
assert.equal(unknown.state, "unknown");

const ready = createReadyExecutionHealth("read accepted");
assert.equal(ready.state, "ready");
assert.equal(ready.message, "read accepted");

const degradedError = new Error("device_request_acceptance_timeout");
assert.equal(isExecutionDegradedError(degradedError), true);
assert.equal(revealExecutionHealthFromError(degradedError).state, "degraded");

const validationError = new Error("Describe a mission goal before launching the team.");
assert.equal(isExecutionDegradedError(validationError), false);
assert.equal(revealExecutionHealthFromError(validationError).state, "unknown");

console.log(JSON.stringify({ ok: true, test: "subAgentsExecutionHealth" }, null, 2));
