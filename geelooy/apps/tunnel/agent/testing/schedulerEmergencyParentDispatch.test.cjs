//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const Dispatch = require("../lib/runtime/main-queue-emergency-dispatch.js");
const Registry = require("../lib/runtime/priority/emergencyRegistry.js");

/**
 * @file Proves scheduler emergency control stays in the parent that owns the live scheduler.
 * @description The Awtsmoos keeps one scheduler and one emergency hand together, while workers may
 * forget process-local memory without forcing native-generation replacement or blocking agent fan-out.
 */
function harness() {
	const sent = [];
	const completed = [];
	const events = [];
	return {
		sent,
		completed,
		events,
		ws: { durableSend: envelope => sent.push(envelope) },
		dependencies: {
			retryControl: { complete: (data, payload, result) => completed.push({ data, payload, result }) },
			streamEvent: (name, payload, result) => events.push({ name, payload, result }),
			Correlation: { fields: payload => ({ logicalAgentId: payload.logicalAgentId || "agent:test" }) },
			Send: { safeSend: (_ws, envelope) => sent.push(envelope) }
		}
	};
}

test("parent dispatch executes status, reconcile, and reset without worker admission", () => {
	const calls = [];
	Registry.register({
		status: () => ({ ok: true, action: "schedulerStatus", source: "parent" }),
		reconcile: reason => ({ ok: true, action: "schedulerReconcile", reason, source: "parent" }),
		reset: reason => ({ ok: true, action: "schedulerReset", reason, source: "parent" })
	});
	for (const action of ["schedulerStatus", "schedulerReconcile", "schedulerReset"]) {
		const state = harness();
		const payload = { action, logicalAgentId: "agent:test" };
		assert.equal(Dispatch.handle(state.dependencies, state.ws, { id: `ctl_${action}` }, payload), true);
		assert.equal(state.sent.length, 1);
		assert.equal(state.sent[0].ok, true);
		assert.equal(state.sent[0].parentOwned, true);
		assert.equal(state.sent[0].controllerScope, "parent");
		assert.equal(state.completed.length, 1);
		calls.push(state.sent[0].action);
	}
	assert.deepEqual(calls, ["schedulerStatus", "schedulerReconcile", "schedulerReset"]);
});

test("non-emergency work is untouched", () => {
	const state = harness();
	assert.equal(Dispatch.handle(state.dependencies, state.ws, { id: "ctl_read" }, { action: "read" }), false);
	assert.equal(state.sent.length, 0);
});

test("an unbound local registry asks for parent rebind, never generation replacement", () => {
	Registry.register(null);
	const result = Registry.status();
	assert.equal(result.ok, false);
	assert.equal(result.error, "scheduler_parent_controller_unavailable");
	assert.equal(result.recovery, "rebind_parent_scheduler_controller");
	assert.equal(result.generationReplacementRequired, false);
});

test("main queue intercepts parent emergency actions before worker queueing", () => {
	const source = fs.readFileSync(path.join(__dirname, "../lib/runtime/main-queue.js"), "utf8");
	assert.match(source, /EmergencyDispatch\.handle\(dependencies, ws, data, payload\)/);
	assert.match(source, /parent_emergency_resolved/);
});
