// B"H
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Atomic = require("../../command/atomicMeta.js");
const Reconciler = require("../../command/reconciler.js");
const RootReconciler = require("../../command/rootReconciler.js");

test("atomic metadata rejects stale revisions", t => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-meta-"));
	t.after(() => fs.rmSync(root, { recursive: true, force: true }));
	const file = path.join(root, "meta.json");
	const first = Atomic.write(file, { jobId: "one", status: "running" });
	assert.equal(first.revision, 0);
	assert.throws(() => Atomic.write(file, { ...first, status: "completed" }, { expectedRevision: 9 }), {
		code: "metadata_revision_conflict"
	});
});

test("reconciliation rejects PID reuse and closes missing child", () => {
	const base = { status: "running", revision: 1, pid: 42, processGroupId: 42, birthToken: "old", history: [] };
	const mismatch = Reconciler.decide(base, { observe: () => ({ alive: true, pid: 42, processGroupId: 42, birthToken: "new" }) });
	assert.equal(mismatch.state, "identity_unverified");
	const missing = Reconciler.decide(base, { observe: () => ({ alive: false, pid: 42 }) });
	assert.equal(missing.state, "stale_lost_worker");
});

test("cross-root planning is bounded and removes only old terminal jobs", t => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "awt-roots-"));
	t.after(() => fs.rmSync(base, { recursive: true, force: true }));
	const old = new Date(Date.now() - 100000).toISOString();
	for (let rootIndex = 0; rootIndex < 4; rootIndex += 1) {
		for (let jobIndex = 0; jobIndex < 5; jobIndex += 1) {
			const directory = path.join(base, `root-${rootIndex}`, ".Awtsmoos", "command-jobs", `job-${jobIndex}`);
			fs.mkdirSync(directory, { recursive: true });
			fs.writeFileSync(path.join(directory, "meta.json"), JSON.stringify({
				jobId: `job-${rootIndex}-${jobIndex}`,
				status: jobIndex < 3 ? "completed" : "running",
				revision: 1,
				finishedAt: jobIndex < 3 ? old : null,
				pid: 999999,
				processGroupId: 999999,
				birthToken: "missing",
				history: []
			}));
		}
	}
	const plan = RootReconciler.plan({ deviceStateRoot: base }, {
		maxRoots: 2,
		maxJobs: 4,
		terminalRetentionMs: 10,
		observe: () => ({ alive: false, pid: 999999 })
	});
	assert.equal(plan.roots.roots.length, 2);
	assert.equal(plan.scannedJobs, 8);
	assert.ok(plan.actions.every(action => ["remove_terminal", "finalize"].includes(action.action)));
	const applied = RootReconciler.apply(plan);
	assert.equal(applied.ok, true);
});
