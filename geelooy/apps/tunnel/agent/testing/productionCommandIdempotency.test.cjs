// B"H
process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = '1';
process.env.AWTSMOOS_COMMAND_MAX_QUEUED = '4';
process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER = '2';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Store = require('../tools/fs/commandJobStore.js');

/** B"H — Identical keys coalesce, changed commands conflict, queued cancel never spawns. */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-idempotency-'));
	const config = commandConfig(root);
	const marker = path.join(root, 'should-not-exist.txt');
	try {
		const command = nodeCommand('setTimeout(()=>{},350)');
		const first = await start(config, 'key-one', command, 'owner-one');
		const second = await start(config, 'key-one', command, 'owner-two');
		assert.equal(second.coalesced, true);
		assert.equal(second.jobId, first.jobId);
		const conflict = await start(config, 'key-one', nodeCommand("console.log('changed')"), 'owner-two');
		assert.equal(conflict.ok, false);
		assert.equal(conflict.error, 'idempotency_conflict');
		const queued = await start(
			config,
			'key-queued',
			nodeCommand(`require('fs').writeFileSync(${JSON.stringify(marker)},'bad')`),
			'owner-three'
		);
		assert.equal(queued.status, 'queued');
		const cancelled = await Store.cancelCommandJob(config, {
			action: 'commandCancel',
			jobId: queued.jobId
		});
		assert.equal(cancelled.status, 'cancelled');
		assert.equal(cancelled.cleanup.state, 'not_started');
		await waitTerminal(config, first.jobId);
		await new Promise(resolve => setTimeout(resolve, 300));
		assert.equal(fs.existsSync(marker), false);
		const overloadOne = await start(config, 'overload-one', nodeCommand('setTimeout(()=>{},300)'), 'same-owner');
		const overloadTwo = await start(config, 'overload-two', nodeCommand('setTimeout(()=>{},300)'), 'same-owner');
		const overloadThree = await start(config, 'overload-three', nodeCommand('setTimeout(()=>{},300)'), 'same-owner');
		assert.equal(overloadOne.status, 'running');
		assert.equal(overloadTwo.status, 'queued');
		assert.equal(overloadThree.ok, false);
		assert.equal(overloadThree.error, 'owner_command_queue_full');
		assert.equal(overloadThree.retryable, true);
		await Store.cancelCommandJob(config, { action: 'commandCancel', jobId: overloadOne.jobId });
		await Store.cancelCommandJob(config, { action: 'commandCancel', jobId: overloadTwo.jobId });
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-command-idempotency',
			coalescedJobId: first.jobId,
			queuedCancelled: queued.jobId
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function start(config, key, command, owner) {
	return Store.startCommandJob(config, {
		action: 'commandRun',
		requestAction: 'commandRun',
		idempotencyKey: key,
		agentSessionId: owner,
		command,
		cwd: config.root,
		timeoutMs: 10000
	});
}

async function waitTerminal(config, jobId) {
	const deadline = Date.now() + 5000;
	while (Date.now() < deadline) {
		const status = await Store.commandStatus(config, { action: 'commandStatus', jobId });
		if (status.done) return status;
		await new Promise(resolve => setTimeout(resolve, 25));
	}
	throw new Error('idempotent_job_not_terminal');
}

function nodeCommand(script) {
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(script)}`;
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
