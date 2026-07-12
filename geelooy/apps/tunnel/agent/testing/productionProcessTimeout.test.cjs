// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Store = require('../tools/fs/commandJobStore.js');
const Group = require('../tools/fs/commandJob/processGroup.js');

/** B"H — Timeout owns the terminal state before close and cleans descendants. */
(async () => {
	if (process.platform === 'win32') {
		console.log(JSON.stringify({ ok: true, skipped: 'unix_process_group_only' }));
		return;
	}
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-family-timeout-'));
	const config = commandConfig(root);
	try {
		const fixture = path.join(__dirname, 'fixtures', 'stubbornCommandFamily.cjs');
		const started = await Store.startCommandJob(config, {
			action: 'commandRun',
			requestAction: 'commandRun',
			command: `${JSON.stringify(process.execPath)} ${JSON.stringify(fixture)}`,
			cwd: root,
			timeoutMs: 350
		});
		const result = await waitTerminal(config, started.jobId, 8000);
		assert.equal(result.status, 'timed_out', JSON.stringify(result));
		assert.equal(result.cleanup.state, 'cleaned');
		assert.ok(result.cleanup.signals.includes('SIGTERM'));
		assert.ok(result.cleanup.signals.includes('SIGKILL'));
		assert.equal(await Group.alive(started.processIdentity.processGroupId), false);
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-process-timeout',
			jobId: started.jobId,
			cleanup: result.cleanup
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

async function waitTerminal(config, jobId, timeoutMs) {
	const deadline = Date.now() + timeoutMs;
	while (Date.now() < deadline) {
		const status = await Store.commandStatus(config, {
			action: 'commandStatus',
			jobId
		});
		if (!['spawning', 'running', 'detached_running', 'cancelling'].includes(status.status)) {
			return status;
		}
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error('timeout_job_did_not_finish');
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
