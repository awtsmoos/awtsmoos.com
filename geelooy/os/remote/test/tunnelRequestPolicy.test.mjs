//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Mutation-aware Tunnel request policy tests.
 * @description
 * The Awtsmoos renews a harmless read after pressure while Awtsmoos.com never repeats a write or server start blindly;
 * one policy test makes retry discipline visible across Drive, File Explorer, runtime, and future browser assistants sharing this client.
 */

import test from "node:test";
import assert from "node:assert/strict";
import {
	policyForControlOperation,
	policyForTunnelAction
} from "../tunnelRequestPolicy.js";

test("read actions may retry transient pressure", () => {
	const policy = policyForTunnelAction("read");
	assert.equal(policy.idempotent, true);
	assert.equal(policy.retries, 2);
	assert.equal(policy.timeoutMs, 30000);
});

test("mutations and server starts never retry automatically", () => {
	for (const action of ["write", "mkdirp", "staticServerStart", "staticServerStop"]) {
		const policy = policyForTunnelAction(action);
		assert.equal(policy.idempotent, false);
		assert.equal(policy.retries, 0);
	}
});

test("control lists may retry while preview mutations may not", () => {
	assert.equal(policyForControlOperation("previewList").retries, 2);
	assert.equal(policyForControlOperation("previewCreate").retries, 0);
	assert.equal(policyForControlOperation("previewRevoke").retries, 0);
});
