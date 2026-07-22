// B"H
const assert = require('node:assert/strict');
const childProcess = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fixtures = require('./helpers/crossRoot/fixtures.cjs');
const Observe = require('../tools/fs/commandJob/processObserve.js');
const Reconciler = require('../tools/fs/commandJob/crossRootReconciler.js');

/** B"H — Reconciliation must never signal an exact live family in the current root. */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'current-root-survival-'));
	const roots = Fixtures.createForest(base);
	const child = childProcess.spawn(
		process.execPath,
		['-e', 'setTimeout(() => {}, 30000)'],
		{ detached: true, stdio: 'ignore' }
	);
	child.unref();
	let cleanupCalls = 0;
	try {
		const observed = await waitForIdentity(child.pid);
		const record = Fixtures.writeJob(roots.current, 'live-current', {
			status: 'running',
			processIdentity: observed
		});
		const report = await Reconciler.runBatch(
			Fixtures.config(base, roots.current),
			{
				apply: true,
				maxRoots: 10,
				maxJobs: 10,
				maxActions: 10,
				cleanup: async () => {
					cleanupCalls += 1;
					return { ok: true, state: 'cleaned' };
				},
				monitorCurrent: async () => ({ started: true, test: true })
			}
		);
		assert.equal(report.ok, true);
		assert.equal(report.receipts[0].action, 'preserve_current_exact');
		assert.equal(Fixtures.readMeta(record).status, 'running');
		assert.equal(cleanupCalls, 0);
		assert.doesNotThrow(() => process.kill(child.pid, 0));
		console.log(JSON.stringify({ ok: true, suite: 'production-current-root-process-survival' }, null, 2));
	} finally {
		killFamily(child.pid);
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => { console.error(error.stack || error); process.exit(1); });

async function waitForIdentity(pid) {
	for (let attempt = 0; attempt < 40; attempt += 1) {
		const observed = await Observe.observe(pid);
		if (observed.alive && observed.birthToken) return observed;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error(`process_identity_unavailable:${pid}`);
}

function killFamily(pid) {
	try {
		process.kill(-pid, 'SIGKILL');
	} catch {
		try { process.kill(pid, 'SIGKILL'); } catch {}
	}
}
