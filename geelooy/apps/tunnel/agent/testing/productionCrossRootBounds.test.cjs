// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fixtures = require('./helpers/crossRoot/fixtures.cjs');
const Reconciler = require('../tools/fs/commandJob/crossRootReconciler.js');

/** B"H — Dry-run bounds roots and actions and never invokes cleanup. */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'cross-root-bounds-'));
	const stateBase = path.join(base, 'device-state');
	let cleanupCalls = 0;
	try {
		for (let rootIndex = 0; rootIndex < 6; rootIndex += 1) {
			const root = path.join(stateBase, `root-${rootIndex}`);
			fs.mkdirSync(root, { recursive: true });
			for (let jobIndex = 0; jobIndex < 5; jobIndex += 1) {
				Fixtures.writeJob(root, `job-${rootIndex}-${jobIndex}`, {
					status: 'running',
					processIdentity: identity(5000 + rootIndex * 10 + jobIndex)
				});
			}
		}
		const current = path.join(stateBase, 'root-5');
		const report = await Reconciler.runBatch(Fixtures.config(base, current), {
			apply: false,
			maxRoots: 2,
			maxJobs: 4,
			maxActions: 3,
			observe: async pid => ({ alive: true, ...identity(pid) }),
			cleanup: async () => { cleanupCalls += 1; return { ok: true, state: 'cleaned' }; }
		});
		assert.equal(report.apply, false);
		assert.equal(report.truncated, true);
		assert.ok(report.selectedRoots <= 2);
		assert.ok(report.receipts.length <= 3);
		assert.equal(cleanupCalls, 0);
		const metas = findMetas(stateBase);
		assert.ok(metas.every(meta => meta.status === 'running'));
		console.log(JSON.stringify({ ok: true, suite: 'production-cross-root-bounds', summary: report.summary }, null, 2));
	} finally {
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => { console.error(error.stack || error); process.exit(1); });

function identity(pid) {
	return { pid, processGroupId: pid, birthToken: `birth-${pid}`, platform: process.platform };
}

function findMetas(root) {
	const output = [];
	for (const directory of fs.readdirSync(root)) {
		const jobs = path.join(root, directory, '.Awtsmoos', 'command-jobs');
		if (!fs.existsSync(jobs)) continue;
		for (const job of fs.readdirSync(jobs)) {
			output.push(JSON.parse(fs.readFileSync(path.join(jobs, job, 'meta.json'), 'utf8')));
		}
	}
	return output;
}
