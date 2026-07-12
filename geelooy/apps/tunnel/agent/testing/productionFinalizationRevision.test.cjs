// B"H
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Store = require('../tools/fs/commandJobStore.js');
const Meta = require('../tools/fs/commandJob/meta.js');

/** B"H — Repeated cancellation and late close cannot revise terminal truth twice. */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-finalize-once-'));
	const config = commandConfig(root);
	try {
		const started = await Store.startCommandJob(config, {
			action: 'commandRun',
			requestAction: 'commandRun',
			command: `${JSON.stringify(process.execPath)} -e ${JSON.stringify("setInterval(()=>{},1000)")}`,
			cwd: root,
			timeoutMs: 30000
		});
		const first = await Store.cancelCommandJob(config, {
			action: 'commandCancel',
			jobId: started.jobId
		});
		const second = await Store.cancelCommandJob(config, {
			action: 'commandCancel',
			jobId: started.jobId
		});
		assert.equal(first.status, 'cancelled');
		assert.equal(second.status, 'cancelled');
		assert.equal(second.alreadyTerminal, true);
		const terminal = await Meta.read(config, started.jobId);
		const revision = terminal.revision;
		await new Promise(resolve => setTimeout(resolve, 750));
		const afterClose = await Meta.read(config, started.jobId);
		assert.equal(afterClose.status, 'cancelled');
		assert.equal(afterClose.revision, revision);
		assert.equal(afterClose.worker.state, 'cancelled');
		assert.equal(afterClose.receipt.state, 'cancelled');
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-finalization-revision',
			jobId: started.jobId,
			revision
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function commandConfig(root) {
	return {
		root,
		deviceStateRoot: path.join(root, '.state'),
		allowCommands: true,
		tools: { command: true },
		command: { enabled: true, defaultShell: '/bin/sh' }
	};
}
