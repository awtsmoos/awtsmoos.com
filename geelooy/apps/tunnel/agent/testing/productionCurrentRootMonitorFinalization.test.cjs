// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Fixtures = require('./helpers/crossRoot/fixtures.cjs');
const Lifecycle = require('../tools/fs/commandJob/lifecycle.js');
const Monitor = require('../tools/fs/commandJob/crossRootMonitor.js');

/** B"H — Preserved work retries terminal persistence before releasing its monitor. */
(async () => {
	const base = fs.mkdtempSync(path.join(os.tmpdir(), 'current-monitor-finalize-'));
	const roots = Fixtures.createForest(base);
	const identity = processIdentity(7001, 'preserved-birth');
	const stored = Fixtures.writeJob(roots.current, 'preserved-current', {
		status: 'running',
		processIdentity: identity
	});
	const rootConfig = {
		...Fixtures.config(base, roots.current),
		commandStateRoot: roots.current
	};
	const record = {
		jobId: stored.meta.jobId,
		stateRoot: roots.current,
		currentRoot: true,
		rootConfig,
		directory: stored.directory,
		metaPath: stored.metaPath,
		meta: stored.meta
	};
	const decision = {
		action: 'preserve_current_exact',
		status: 'running',
		expected: identity,
		processComparison: { ok: true, state: 'exact' }
	};
	let finalizeCalls = 0;
	const warnings = [];
	try {
		const receipt = Monitor.start(record, decision, {
			recoveredPollMs: 10,
			observe: async pid => ({ alive: false, pid }),
			log: (level, message) => warnings.push({ level, message }),
			finalize: async (...argumentsList) => {
				finalizeCalls += 1;
				if (finalizeCalls === 1) throw new Error('synthetic_finalize_failure');
				return Lifecycle.finalizeDetached(...argumentsList);
			}
		});
		assert.equal(receipt.started, true);
		await waitFor(() => finalizeCalls >= 2 && Monitor.active.size === 0);
		const meta = Fixtures.readMeta(stored);
		assert.equal(meta.status, 'stale_lost_worker');
		assert.equal(meta.startupPreserved, true);
		assert.equal(finalizeCalls, 2);
		assert.equal(warnings.length, 1);
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-current-root-monitor-finalization',
			finalizeCalls
		}, null, 2));
	} finally {
		Monitor.stopAll();
		fs.rmSync(base, { recursive: true, force: true });
	}
})().catch(error => { console.error(error.stack || error); process.exit(1); });

function processIdentity(pid, birthToken) {
	return { pid, processGroupId: pid, birthToken, platform: process.platform };
}

async function waitFor(predicate) {
	const deadline = Date.now() + 2000;
	while (Date.now() < deadline) {
		if (predicate()) return;
		await new Promise(resolve => setTimeout(resolve, 10));
	}
	throw new Error('monitor_finalization_timeout');
}
