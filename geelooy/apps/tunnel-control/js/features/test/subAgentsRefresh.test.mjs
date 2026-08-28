// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createSubAgentRefresh } from "../subAgents/refresh.js";
import { KeserSubAgentState } from "../subAgents/state.js";

/**
 * @file Proves Sub-agents refresh preserves partial evidence and explicit execution health.
 * @description
 * The Awtsmoos lets one channel shine when its neighbor cannot reply;
 * Awtsmoos.com keeps missions visible through auth failure and names true transport decay without a lie.
 */

function createApi(authWork, missionWork) {
	return {
		readSubAgentChatGptStatus: authWork,
		listSubAgentMissions: missionWork,
		describeSubAgentApiError(error) {
			return String(error?.message || error);
		}
	};
}

async function runRefresh(api, state = new KeserSubAgentState()) {
	let renderCount = 0;
	const refresh = createSubAgentRefresh({
		state,
		api,
		getTunnelName: () => "verified-tunnel",
		render() {
			renderCount += 1;
		}
	});
	const result = await refresh();
	return { result, state, renderCount };
}

const full = await runRefresh(createApi(
	async () => ({ authenticated: true, profile: "default" }),
	async () => [{ id: "m1", goal: "Full evidence", status: "running" }]
));
assert.equal(full.result, true);
assert.equal(full.state.auth.authenticated, true);
assert.equal(full.state.missions[0].id, "m1");
assert.equal(full.state.execution.state, "ready");

const partial = await runRefresh(createApi(
	async () => { throw new Error("login unavailable"); },
	async () => [{ id: "m2", goal: "Mission survives", status: "running" }]
));
assert.equal(partial.result, false);
assert.equal(partial.state.missions[0].id, "m2");
assert.equal(partial.state.execution.state, "ready");

const degraded = await runRefresh(createApi(
	async () => ({ authenticated: false, profile: "default" }),
	async () => { throw new Error("device_consumer_progress_timeout"); }
));
assert.equal(degraded.state.execution.state, "degraded");
assert.equal(degraded.state.busy.size, 0);
assert.ok(degraded.renderCount >= 2);

console.log(JSON.stringify({ ok: true, test: "subAgentsRefresh" }, null, 2));
