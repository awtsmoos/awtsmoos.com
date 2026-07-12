// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Store = require('../tools/fs/commandJobStore.js');
const Group = require('../tools/fs/commandJob/processGroup.js');

/** B"H — A resistant parent and descendant are removed as one command family. */
(async () => {
	if (process.platform === 'win32') {
		console.log(JSON.stringify({ ok: true, skipped: 'unix_process_group_only' }));
		return;
	}
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-family-cancel-'));
	const config = commandConfig(root);
	try {
		const fixture = path.join(__dirname, 'fixtures', 'stubbornCommandFamily.cjs');
		const started = await Store.startCommandJob(config, {
			action: 'commandRun',
			requestAction: 'commandRun',
			command: `${JSON.stringify(process.execPath)} ${JSON.stringify(fixture)}`,
			cwd: root,
			timeoutMs: 30000
		});
		assert.equal(started.ok, true);
		assert.ok(started.processIdentity?.birthToken, JSON.stringify(started));
		assert.equal(started.processIdentity.processGroupId, started.processIdentity.pid);
		await waitForReady(config, started.jobId);
		const cancelled = await Store.cancelCommandJob(config, {
			action: 'commandCancel',
			jobId: started.jobId
		});
		assert.equal(cancelled.status, 'cancelled', JSON.stringify(cancelled));
		assert.equal(cancelled.cleanup.state, 'cleaned');
		assert.ok(cancelled.cleanup.signals.includes('SIGTERM'));
		assert.ok(cancelled.cleanup.signals.includes('SIGKILL'));
		assert.equal(await Group.alive(started.processIdentity.processGroupId), false);
		const status = await Store.commandStatus(config, {
			action: 'commandStatus',
			jobId: started.jobId
		});
		assert.equal(status.status, 'cancelled');
		assert.equal(status.worker.state, 'cancelled');
		assert.equal(status.receipt.state, 'cancelled');
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-process-family-cancel',
			jobId: started.jobId,
			cleanup: cancelled.cleanup
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function waitForReady(config, jobId) {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const page = await Store.commandJobOutputPage(config, {
			action: 'commandJobOutputPage',
			jobId,
			stream: 'stdout',
			maxChars: 4000
		});
		if (String(page.content || '').includes('"ready":true')) return;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error('stubborn_family_not_ready');
}

function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, '.state'),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: '/bin/sh' }
	};
}
