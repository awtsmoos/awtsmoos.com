//B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import test from "node:test";
import { OwnedHostInspector } from "../relay/direct/browser/OwnedHostInspector.mjs";
import { AuthenticatedHostHealth } from "../relay/direct/browser/AuthenticatedHostHealth.mjs";

/** Readiness uses native DOM inspection and no page script or network dependency. */
test("owned host inspector remains page-script-free and network-free", async () => {
	const requests = [];
	const inspector = new OwnedHostInspector({
		async send(method, params, timeoutMs) {
			requests.push({ method, params, timeoutMs });
			if (method === "DOM.getDocument") return { root: { nodeId: 1 } };
			if (method === "DOM.querySelector") {
				return { nodeId: params.selector.includes("prompt-textarea") ? 7 : 0 };
			}
			if (method === "DOM.getBoxModel") {
				return { model: { content: [0, 0, 100, 0, 100, 40, 0, 40] } };
			}
			if (method === "Target.getTargetInfo") {
				return { targetInfo: { title: "Awtsmoos Shliach", url: "https://chatgpt.com/g/agent" } };
			}
			return {};
		}
	});
	const state = await inspector.inspect();
	assert.equal(state.authenticated, true);
	assert.equal(state.composerVisible, true);
	assert.equal(requests.some(request => request.method === "Runtime.evaluate"), false);
	assert.equal(requests.some(request => request.method.startsWith("Network.")), false);
	assert.ok(requests.some(request => request.method === "DOM.getDocument"));
	assert.ok(requests.some(request => request.method === "DOM.getBoxModel"));
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
