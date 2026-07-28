//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OwnedHostInspector } from "../relay/direct/browser/OwnedHostInspector.mjs";
import { AuthenticatedHostHealth } from "../relay/direct/browser/AuthenticatedHostHealth.mjs";

/** Readiness uses one synchronous expression and no session or socket dependency. */
test("owned host inspector remains synchronous and network-free", async () => {
	let request = null;
	const inspector = new OwnedHostInspector({
		async send(method, params, timeoutMs) {
			request = { method, params, timeoutMs };
			return { result: { value: { authenticated: true, composerVisible: true } } };
		}
	});
	const state = await inspector.inspect();
	assert.equal(state.authenticated, true);
	assert.equal(request.method, "Runtime.evaluate");
	assert.equal(request.params.awaitPromise, undefined);
	assert.doesNotMatch(request.params.expression, /fetch\s*\(/);
	assert.doesNotMatch(request.params.expression, /api\/auth\/session/);
	assert.doesNotMatch(request.params.expression, /WebSocket/);
	assert.equal(request.timeoutMs, 4000);
});

/** Reuse health requires an authenticated composer and rejects a challenge. */
test("authenticated host health requires a safe composer", async () => {
	const health = new AuthenticatedHostHealth();
	const healthy = await health.inspect({
		inspector: { async inspect() {
			return { authenticated: true, composerVisible: true, challenge: false };
		} }
	});
	const unhealthy = await health.inspect({
		inspector: { async inspect() {
			return { authenticated: false, composerVisible: false, challenge: true };
		} }
	});
	assert.equal(healthy, true);
	assert.equal(unhealthy, false);
});
