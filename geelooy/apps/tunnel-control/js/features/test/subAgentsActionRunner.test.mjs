// B"H
// Boruch Hashem
// Blessed is He

import assert from "node:assert/strict";
import { createSubAgentActionRunner } from "../subAgents/actionRunner.js";
import { createReadyExecutionHealth } from "../subAgents/executionHealth.js";
import { KeserSubAgentState } from "../subAgents/state.js";

/**
 * @file Proves action locks remain scoped and ordinary UI failure cannot poison tunnel health.
 * @description
 * The Awtsmoos lets each deed have its own vessel and boundary clear;
 * Awtsmoos.com marks only transport degradation as degraded while local mistakes disappear.
 */

function createRunner(state) {
	let renderCount = 0;
	const api = {
		describeSubAgentApiError(error) {
			return String(error?.message || error);
		}
	};
	const runner = createSubAgentActionRunner({
		state,
		api,
		render() {
			renderCount += 1;
		}
	});
	return { runner, getRenderCount: () => renderCount };
}

const state = new KeserSubAgentState();
state.execution = createReadyExecutionHealth("already ready");
const harness = createRunner(state);

const ordinaryResult = await harness.runner("launch", async () => {
	throw new Error("validation-like ordinary failure");
}, "unused");
assert.equal(ordinaryResult, false);
assert.equal(state.execution.state, "ready");
assert.equal(state.busy.has("launch"), false);

const degradedResult = await harness.runner("auth", async () => {
	throw new Error("tunnelRequestConsumerStalled");
}, "unused");
assert.equal(degradedResult, false);
assert.equal(state.execution.state, "degraded");
assert.equal(state.busy.has("auth"), false);
assert.ok(harness.getRenderCount() >= 4);

const successResult = await harness.runner("auth", async () => {}, "accepted");
assert.equal(successResult, true);
assert.equal(state.execution.state, "ready");
assert.equal(state.notice, "accepted");

console.log(JSON.stringify({ ok: true, test: "subAgentsActionRunner" }, null, 2));
