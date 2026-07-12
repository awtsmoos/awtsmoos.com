// B"H
const assert = require('node:assert/strict');
const path = require('node:path');
const { createProcessSupervisor } = require('../lib/runtime/worker-processes.js');

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

/** B"H — Shutdown disables restart before signaling every helper child. */
(async () => {
	const supervisor = createProcessSupervisor({ log() {} });
	const record = supervisor.define('helper', {
		modulePath: path.join(__dirname, 'fixtures', 'helperWorker.cjs'),
		restart: true
	});
	supervisor.start('helper');
	await sleep(50);
	assert.equal(record.status, 'running');
	const receipt = supervisor.stopAll('SIGTERM');
	assert.deepEqual(receipt.stopped, ['helper']);
	assert.equal(record.spec.restart, false);
	assert.equal(record.restartTimer, null);
	for (let index = 0; index < 50 && record.child; index += 1) await sleep(10);
	assert.equal(record.child, null);
	await sleep(550);
	assert.equal(record.child, null);
	assert.equal(record.restartTimer, null);
	console.log(JSON.stringify({ ok: true, suite: 'worker-process-shutdown' }, null, 2));
})().catch(error => {
	console.error(error);
	process.exit(1);
});
