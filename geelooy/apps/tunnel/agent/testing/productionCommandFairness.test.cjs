// B"H
process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = '2';
process.env.AWTSMOOS_COMMAND_MAX_QUEUED = '20';
process.env.AWTSMOOS_COMMAND_MAX_QUEUED_PER_OWNER = '10';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const Store = require('../tools/fs/commandJobStore.js');
const Scheduler = require('../tools/fs/commandJob/scheduler.js');

/** B"H — Two active slots rotate queued owners instead of serving one flood first. */
(async () => {
	const root = fs.mkdtempSync(path.join(os.tmpdir(), 'production-fairness-'));
	const config = commandConfig(root);
	const orderFile = path.join(root, 'order.txt');
	try {
		const blockerOne = await start(config, 'blocker-one', sleepCommand(450));
		const blockerTwo = await start(config, 'blocker-two', sleepCommand(450));
		assert.equal(blockerOne.status, 'running');
		assert.equal(blockerTwo.status, 'running');
		const queued = [];
		queued.push(await start(config, 'owner-a', appendCommand(orderFile, 'A1')));
		queued.push(await start(config, 'owner-a', appendCommand(orderFile, 'A2')));
		queued.push(await start(config, 'owner-b', appendCommand(orderFile, 'B1')));
		queued.push(await start(config, 'owner-b', appendCommand(orderFile, 'B2')));
		assert.ok(queued.every(result => result.status === 'queued'));
		assert.equal(Scheduler.snapshot().active, 2);
		assert.equal(Scheduler.snapshot().queued, 4);
		let maxObserved = 0;
		const all = [blockerOne, blockerTwo, ...queued];
		while (Scheduler.snapshot().active || Scheduler.snapshot().queued) {
			maxObserved = Math.max(maxObserved, Scheduler.snapshot().active);
			await new Promise(resolve => setTimeout(resolve, 20));
		}
		for (const job of all) {
			const status = await Store.commandStatus(config, {
				action: 'commandStatus',
				jobId: job.jobId
			});
			assert.equal(status.status, 'completed', JSON.stringify(status));
		}
		const order = fs.readFileSync(orderFile, 'utf8').trim().split(/\r?\n/);
		assert.deepEqual(new Set(order.slice(0, 2)), new Set(['A1', 'B1']));
		assert.deepEqual(new Set(order.slice(2)), new Set(['A2', 'B2']));
		assert.ok(maxObserved <= 2);
		assert.equal(Scheduler.snapshot().active, 0);
		assert.equal(Scheduler.snapshot().queued, 0);
		console.log(JSON.stringify({
			ok: true,
			suite: 'production-command-fairness',
			order,
			maxObserved
		}, null, 2));
	} finally {
		fs.rmSync(root, { recursive: true, force: true });
	}
})().catch(error => {
	console.error(error.stack || error);
	process.exit(1);
});

function start(config, ownerId, command) {
	return Store.startCommandJob(config, {
		action: 'commandRun',
		requestAction: 'commandRun',
		agentSessionId: ownerId,
		command,
		cwd: config.root,
		timeoutMs: 10000
	});
}

function sleepCommand(milliseconds) {
	return `${JSON.stringify(process.execPath)} -e ${JSON.stringify(`setTimeout(()=>{},${milliseconds})`)}`;
}

function appendCommand(file, label) {
	const script = `require('fs').appendFileSync(${JSON.stringify(file)},${JSON.stringify(`${label}\n`)});setTimeout(()=>{},80)`;
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
