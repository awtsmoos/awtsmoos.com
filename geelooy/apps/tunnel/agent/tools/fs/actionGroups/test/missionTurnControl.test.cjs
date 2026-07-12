// B"H

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Mission = require("../../mission/index.js");
const Decision = require("../../mission/continuationControl/decision.js");
const Runtime = require("../../mission/continuationControl/runtime.js");
const Store = require("../../mission/continuationControl/store.js");

function mission(id) {
	const now = new Date().toISOString();
	return { id, goal: `Mission ${id}`, createdAt: now, updatedAt: now };
}

(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-turn-control-"));
	const config = { root, metadataRoot: path.join(root, ".metadata") };
	try {
		await Mission.save(config, mission("turn-one"));
		const initial = await Store.read(config, { missionId: "turn-one" });
		assert.equal(initial.control.revision, 0);
		assert.equal(initial.control.desiredState, "running");

		const deep = await Store.patch(config, {
			missionId: "turn-one",
			expectedRevision: 0,
			policy: { preset: "deep" },
			actor: "human"
		});
		assert.equal(deep.control.revision, 1);
		assert.equal(deep.control.maxTurns, 100);

		const ticket = await Runtime.beforeTick(config, { missionId: "turn-one" });
		assert.equal(ticket.decision.allowed, true);
		assert.equal(ticket.control.startedTurns, 1);
		assert.equal(ticket.control.revision, 1, "runtime accounting must not change policy revision");
		assert.equal(ticket.control.runtimeRevision, 1);

		const finished = await Runtime.afterTick(config, { missionId: "turn-one" }, { ok: true, action: "missionNext" }, null, ticket);
		assert.equal(finished.control.completedTurns, 1);
		assert.equal(finished.control.revision, 1);
		assert.equal(finished.control.runtimeRevision, 2);

		const conflict = await Store.patch(config, {
			missionId: "turn-one",
			expectedRevision: 0,
			policy: { maxTurns: 2 }
		});
		assert.equal(conflict.error, "continuation_revision_conflict");

		const paused = await Store.mutate(config, { missionId: "turn-one", expectedRevision: 1 }, control => ({
			...control,
			desiredState: "paused"
		}));
		assert.equal(paused.control.revision, 2);
		const blocked = await Runtime.beforeTick(config, { missionId: "turn-one" });
		assert.equal(blocked.decision.allowed, false);
		assert.equal(blocked.decision.reason, "paused_by_user");

		const credited = await Store.mutate(config, { missionId: "turn-one", expectedRevision: 2 }, control => ({
			...control,
			oneTurnCredits: 1
		}));
		assert.equal(credited.control.revision, 3);
		const oneTurn = await Runtime.beforeTick(config, { missionId: "turn-one" });
		assert.equal(oneTurn.decision.oneTurn, true);
		assert.equal(oneTurn.control.oneTurnCredits, 0);
		const oneFinished = await Runtime.afterTick(config, { missionId: "turn-one" }, { ok: true, action: "missionNext" }, null, oneTurn);
		assert.equal(oneFinished.control.observedState, "paused");

		const budget = Decision.before({ ...oneFinished.control, desiredState: "running", maxTurns: oneFinished.control.startedTurns });
		assert.equal(budget.reason, "turn_budget_reached");
		console.log(JSON.stringify({ ok: true, control: oneFinished.control }, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error.message);
	process.exit(1);
});
