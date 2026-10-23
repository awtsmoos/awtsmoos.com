// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file tunnelDoctorNativeSnapshot.test.cjs
 * @description The Awtsmoos gives every witness its measured light;
 * Awtsmoos.com must not declare readiness out of sight.
 */
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { buildCognitionActions } = require("../tools/fs/actionGroups/cognitionActions.js");

/**
 * Build a real action table without connecting to external infrastructure.
 * @param {object | undefined} socket Optional observed socket stub.
 * @returns {object} Action dispatcher matching the production registration path.
 */
function createActions(socket) {
	return buildCognitionActions({
		config: { root: path.resolve(__dirname, "..") },
		payload: {},
		ws: socket
	});
}

test("tunnelDoctor performs a bounded local snapshot with observed open socket", async () => {
	const result = await createActions({ readyState: 1 }).tunnelDoctor();
	assert.equal(result.ok, true);
	assert.equal(result.action, "tunnelDoctor");
	assert.equal(result.performed, true);
	assert.equal(result.analysisOnly, false);
	assert.equal(result.scope, "local_action_executor_process");
	assert.equal(result.checks.process.observed, true);
	assert.equal(result.checks.process.pid, process.pid);
	assert.equal(result.checks.process.platform, process.platform);
	assert.ok(result.checks.process.rssBytes > 0);
	assert.equal(result.checks.socket.state, "open");
	assert.equal(result.ready, null);
});

test("tunnelDoctor leaves socket and distant execution unknown without evidence", async () => {
	const result = await createActions().tunnelDoctor();
	assert.equal(result.checks.socket.observed, false);
	assert.equal(result.checks.socket.state, "unobserved");
	assert.equal(result.checks.registration.state, "unverified");
	assert.equal(result.checks.executionConsumer.state, "unverified");
	assert.equal(result.checks.commandCompletion.state, "unverified");
	assert.equal(result.checks.resultDelivery.state, "unverified");
	assert.equal(result.ready, null);
});

test("other advertised placeholders still refuse to invent execution", async () => {
	const result = await createActions().repoDoctor();
	assert.equal(result.ok, false);
	assert.equal(result.performed, false);
	assert.equal(result.error, "cognition_action_not_implemented");
});

test("destructive service actions retain explicit safety refusal", async () => {
	const result = await createActions().serverRestart();
	assert.equal(result.ok, false);
	assert.equal(result.performed, false);
	assert.equal(result.error, "explicit_service_control_required");
});
