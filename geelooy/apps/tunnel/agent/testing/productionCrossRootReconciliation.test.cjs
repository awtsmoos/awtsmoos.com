// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Fixtures = require("./helpers/crossRoot/fixtures.cjs");
const Processes = require("./helpers/crossRoot/processFixtures.cjs");
const Reconciler = require("../tools/fs/commandJob/crossRootReconciler.js");
const Supervisor = require("../lib/runtime/worker-supervisor.js");

/**
 * @file Proves startup reconciliation preserves exactly one terminal owner.
 * @description
 * The Awtsmoos reveals inherited and presently owned commands as different
 * vessels. Awtsmoos.com monitors only inherited work and never double-watches
 * the child whose live registry already owns its close, timeout, and reaping.
 */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), "cross-root-reconcile-"));
	const roots = Fixtures.createForest(base);
	const oldDate = new Date(Date.now() - 120000).toISOString();
	const terminal = Fixtures.writeJob(roots.old, "terminal-old", {
		status: "completed",
		finishedAt: oldDate,
		updatedAt: oldDate
	});
	const queued = Fixtures.writeJob(roots.old, "queued-old", { status: "queued" });
	const dead = Fixtures.writeJob(roots.middle, "dead-old", {
		status: "running",
		processIdentity: Processes.identity(1001, "dead-birth")
	});
	const mismatch = Fixtures.writeJob(roots.middle, "mismatch-old", {
		status: "running",
		processIdentity: Processes.identity(1002, "original-birth")
	});
	const inherited = Fixtures.writeJob(roots.current, "inherited-current", {
		status: "running",
		processIdentity: Processes.identity(1003, "current-birth")
	});
	const liveOwned = Fixtures.writeJob(roots.current, "live-owned", {
		status: "running",
		processIdentity: Processes.identity(1005, "live-birth")
	});
	const exactOld = Fixtures.writeJob(roots.old, "exact-old", {
		status: "running",
		processIdentity: Processes.identity(1004, "old-birth")
	});
	const registry = Supervisor.createRegistry();
	registry.registerWorker(Processes.registryRecord(liveOwned.meta), {});
	let cleanupCalls = 0;
	let monitorCalls = 0;
	try {
		const report = await Reconciler.runUntilSettled(
			Fixtures.config(base, roots.current),
			options(registry, () => cleanupCalls += 1, () => monitorCalls += 1)
		);
		assert.equal(report.ok, true);
		assert.equal(fs.existsSync(terminal.directory), false);
		assert.equal(Fixtures.readMeta(queued).status, "cancelled");
		assert.equal(Fixtures.readMeta(dead).status, "stale_lost_worker");
		assert.equal(Fixtures.readMeta(mismatch).status, "identity_unverified");
		assert.equal(Fixtures.readMeta(inherited).status, "running");
		assert.equal(Fixtures.readMeta(liveOwned).status, "running");
		assert.equal(Fixtures.readMeta(exactOld).status, "cancelled");
		assert.equal(cleanupCalls, 1);
		assert.equal(monitorCalls, 1);
		assert.equal(report.reports[0].summary.counts.preserve_current_exact, 1);
		assert.equal(report.reports[0].summary.counts.preserve_live_owned, 1);
		console.log(JSON.stringify({
			ok: true,
			suite: "production-cross-root-reconciliation"
		}));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function options(registry, cleaned, monitored) {
	return {
		apply: true,
		maxRoots: 10,
		maxJobs: 50,
		maxActions: 20,
		terminalRetentionMs: 1,
		registry,
		observe: Processes.observeProcess,
		cleanup: async expected => {
			cleaned();
			assert.equal(expected.pid, 1004);
			return { ok: true, state: "cleaned", signals: ["SIGTERM"] };
		},
		monitorCurrent: async record => {
			monitored();
			assert.equal(record.jobId, "inherited-current");
			return { started: true, test: true };
		}
	};
}
