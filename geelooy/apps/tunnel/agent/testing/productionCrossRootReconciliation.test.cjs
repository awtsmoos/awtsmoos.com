// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fixtures = require('./helpers/crossRoot/fixtures.cjs');
const Reconciler = require('../tools/fs/commandJob/crossRootReconciler.js');

/** B"H — Current exact work survives while obsolete exact work is reconciled. */
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
	const exactCurrent = Fixtures.writeJob(roots.current, 'exact-current', {
		status: 'running',
		processIdentity: identity(1003, 'current-birth')
	});
	const exactOld = Fixtures.writeJob(roots.old, 'exact-old', {
		status: 'running',
		processIdentity: identity(1004, 'old-birth')
	});
	let cleanupCalls = 0;
	let monitorCalls = 0;
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
					assert.equal(expected.pid, 1004);
					return cleaned();
				},
				monitorCurrent: async (record, decision) => {
					monitorCalls += 1;
					assert.equal(record.jobId, 'exact-current');
					assert.equal(decision.expected.pid, 1003);
					return { started: true, test: true };
				}
			}
		);
		assert.equal(report.ok, true);
		assert.equal(fs.existsSync(terminal.directory), false);
		assert.equal(Fixtures.readMeta(queued).status, 'cancelled');
		assert.equal(Fixtures.readMeta(dead).status, 'stale_lost_worker');
		assert.equal(Fixtures.readMeta(mismatch).status, 'identity_unverified');
		assert.equal(Fixtures.readMeta(exactCurrent).status, 'running');
		assert.equal(Fixtures.readMeta(exactOld).status, 'cancelled');
		assert.equal(cleanupCalls, 1);
		assert.equal(monitorCalls, 1);
		assert.equal(report.reports[0].summary.counts.preserve_current_exact, 1);
		console.log(JSON.stringify({ ok: true, suite: 'production-cross-root-reconciliation' }, null, 2));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => { console.error(error.stack || error); process.exit(1); });

function identity(pid, birthToken) {
	return { pid, processGroupId: pid, birthToken, platform: process.platform };
}

function cleaned() {
	return { ok: true, state: 'cleaned', signals: ['SIGTERM'], at: new Date().toISOString() };
}

async function observeProcess(pid) {
	if (pid === 1001) return { alive: false, pid };
	if (pid === 1002) return { alive: true, ...identity(pid, 'recycled-birth') };
	if (pid === 1003) return { alive: true, ...identity(pid, 'current-birth') };
	if (pid === 1004) return { alive: true, ...identity(pid, 'old-birth') };
	return { alive: false, pid };
}
