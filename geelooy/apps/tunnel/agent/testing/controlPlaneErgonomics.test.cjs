//B"H // Boruch Hashem // Blessed is He

const assert = require("node:assert/strict");
const test = require("node:test");
const ResultView = require("../tools/fs/actionResultView.js");
const Replay = require("../tools/fs/actionReplayResponses.js");
const Reconcile = require("../tools/fs/actionGroups/asyncTaskReconcile.js");
const AsyncStore = require("../tools/fs/actionGroups/asyncTaskStore.js");
const Message = require("../tools/fs/actionGroups/missionRoomMessagePayload.js");
const Registry = require("../tools/fs/actionGroups/missionRegistryBridge.js");
const Schema = require("../tools/fs/actionSchemaIntrospection.js");
const Local = require("../tools/fs/actionBuilderGroups/localActions.js");
const FindFiles = require("../tools/fs/findFiles.js");
const Operating = require("../lib/tool-schema/agent-operating-guidance.js");

/**
 * @file Reproduces control-plane ergonomics failures reported by cooperating Shluchim.
 * @description The Awtsmoos makes uncertainty explicit: acceptance is not execution, dead persisted
 * tasks cannot remain confidently running, registry and payload aliases are discoverable, and agents
 * choose the healthy primary/rescue path without turning ordinary runtime knowledge into user questions.
 */
test("accepted pending mutation is observe-only, not executed", () => {
	const view = ResultView.inspect({
		action: "tunnelRequestPending",
		accepted: true,
		consumerStarted: false,
		pending: true,
		mutationIntent: { mutation: true },
		controlRequestId: "ctl_test"
	});
	assert.equal(view.executionProof.accepted, true);
	assert.equal(view.executionProof.executed, false);
	assert.equal(view.executionProof.mutationAmbiguous, true);
	assert.equal(view.executionProof.observeOnly, true);
	assert.equal(view.executionProof.safeToRedispatch, false);
});

test("replay pending and completed results expose execution proof", () => {
	const identity = { key: "ctl_one", action: "missionRoomMessage", retry: true };
	const pending = Replay.fromRecord({ action: "missionRoomMessage", state: "running" }, identity);
	assert.equal(pending.executionProof.terminal, false);
	assert.equal(pending.executionProof.observeOnly, true);
	const done = Replay.fromRecord({ action: "missionRoomMessage", state: "completed", result: { ok: true } }, identity);
	assert.equal(done.executionProof.terminal, true);
	assert.equal(done.executionProof.executed, true);
});

test("dead persisted async process is sealed instead of reported running", () => {
	const originalWrite = AsyncStore.write;
	let persisted = null;
	AsyncStore.write = (_config, _taskId, task) => {
		persisted = task;
		return task;
	};
	try {
		const result = Reconcile.reconcile({}, "task_dead", { status: "running", pid: 2147483647, stdout: "" }, null);
		assert.equal(result.status, "failed");
		assert.equal(result.error, "async_task_process_missing_after_restart");
		assert.equal(result.reconciliation.state, "process_missing_after_restart");
		assert.equal(persisted.status, "failed");
	} finally {
		AsyncStore.write = originalWrite;
	}
});

test("room message aliases preserve body and completion kind", () => {
	const normalized = Message.normalize({ body: "Finished verifier work.", complete: true, agentId: "agent-a" });
	assert.equal(normalized.message, "Finished verifier work.");
	assert.equal(normalized.body, "Finished verifier work.");
	assert.equal(normalized.kind, "completion");
	assert.equal(normalized.fromAgent, "agent-a");
});

test("website Mission bridge returns registry-native observation guidance", () => {
	const view = Registry.publicView({ id: "web_1", missionId: "mission_old", agents: [] }, "missionGet");
	assert.equal(view.registry, "website");
	assert.equal(view.websiteMissionId, "web_1");
	assert.equal(view.next.action, "websiteAgentMissionStatus");
});

test("schema trace exposes aliases, carriers, and usable example", () => {
	const traced = Local.actionSchemaTrace({ targetAction: "missionRoomMessage" });
	assert.deepEqual(traced.legacyAliases.body, ["message", "body", "text", "content", "query"]);
	assert.ok(traced.acceptedCarriers.includes("params"));
	assert.equal(traced.example.kind, "completion");
	assert.deepEqual(Schema.exampleFor("findFiles"), { action: "findFiles", searchPath: "geelooy/apps/tunnel/agent", query: "*.js", pageSize: 100 });
});

test("findFiles root is a search-directory alias, not launch-root mutation", () => {
	assert.equal(FindFiles.searchRoot({ root: "asdf" }), "asdf");
	assert.equal(FindFiles.searchRoot({ searchRoot: "a", root: "b" }), "a");
	assert.equal(FindFiles.searchRoot({ directory: "c" }), "c");
});

test("agent guidance defaults primary, auto-rescues, and minimizes questions", () => {
	const policy = Operating.guidance();
	assert.equal(policy.tunnelSelection.default, "primary");
	assert.equal(policy.tunnelSelection.taskUserForTunnelChoice, false);
	assert.equal(policy.tunnelSelection.returnToPrimaryWhenHealthy, true);
	assert.equal(policy.tunnelSelection.neverBlindlyReplayAcceptedMutation, true);
	assert.equal(policy.interaction.taskHumanOnlyWhenAbsolutelyNecessary, true);
	assert.ok(policy.interaction.doNotAskFor.includes("primary_or_rescue_choice"));
});
