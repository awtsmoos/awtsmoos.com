// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fixtures = require('./helpers/crossRoot/fixtures.cjs');
const Reconciler = require('../tools/fs/commandJob/crossRootReconciler.js');

/** B"H — Startup resolves every old command without signaling recycled identity. */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-root-reconcile-'));
	const roots = Fixtures.createForest(base);
	const oldDate = new Date(Date.now() - 120000).toISOString();
	const terminal = Fixtures.writeJob(roots.old, 'terminal-old', {
		status: 'completed',
		finishedAt: oldDate,
		updatedAt: oldDate
	});
	const queued = Fixtures.writeJob(roots.old, 'queued-old', { status: 'queued' });
	const dead = Fixtures.writeJob(roots.middle, 'dead-old', {
		status: 'running',
		processIdentity: identity(1001, 'dead-birth')
	});
	const mismatch = Fixtures.writeJob(roots.middle, 'mismatch-old', {
		status: 'running',
		processIdentity: identity(1002, 'original-birth')
	});
	const exact = Fixtures.writeJob(roots.current, 'exact-old', {
		status: 'running',
		processIdentity: identity(1003, 'exact-birth')
	});
	let cleanupCalls = 0;
	try {
		const report = await Reconciler.runUntilSettled(
			Fixtures.config(base, roots.current),
			{
				apply: true,
				maxRoots: 10,
				maxJobs: 50,
				maxActions: 20,
				terminalRetentionMs: 1,
				observe: observeProcess,
				cleanup: async expected => {
					cleanupCalls += 1;
					assert.equal(expected.pid, 1003);
					return { ok: true, state: 'cleaned', signals: ['SIGTERM'], at: new Date().toISOString() };
				}
			}
		);
		assert.equal(report.ok, true);
		assert.equal(fs.existsSync(terminal.directory), false);
		assert.equal(Fixtures.readMeta(queued).status, 'cancelled');
		assert.equal(Fixtures.readMeta(queued).cleanup.state, 'not_started');
		assert.equal(Fixtures.readMeta(dead).status, 'stale_lost_worker');
		assert.equal(Fixtures.readMeta(mismatch).status, 'identity_unverified');
		assert.equal(Fixtures.readMeta(exact).status, 'cancelled');
		assert.equal(Fixtures.readMeta(exact).cleanup.state, 'cleaned');
		assert.equal(cleanupCalls, 1);
		console.log(JSON.stringify({ ok: true, suite: 'production-cross-root-reconciliation', batches: report.batches }, null, 2));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => { console.error(error.stack || error); process.exit(1); });

function identity(pid, birthToken) {
	return { pid, processGroupId: pid, birthToken, platform: process.platform };
}

async function observeProcess(pid) {
	if (pid === 1001) return { alive: false, pid };
	if (pid === 1002) return { alive: true, ...identity(pid, 'recycled-birth') };
	if (pid === 1003) return { alive: true, ...identity(pid, 'exact-birth') };
	return { alive: false, pid };
}
