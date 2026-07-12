// B"H
const assert = require('node:assert/strict');
const { responseEnvelope } = require('../lib/runtime/envelope.js');

/** B"H — Missing request identity may never erase result-side command identity. */
(() => {
	const envelope = responseEnvelope(
		{ id: 'transport-command-identity' },
		{ kind: 'command', action: 'commandRun', tunnelName: 'awt-test' },
		{
			ok: true,
			action: 'commandRun',
			requestAction: 'commandRun',
			actualAction: 'commandStart',
			status: 'running',
			jobId: 'job-command-identity',
			workerId: 'worker-command-identity',
			receipt: {
				receiptId: 'receipt-command-identity',
				workerId: 'worker-command-identity'
			},
			worker: {
				workerId: 'worker-command-identity',
				jobId: 'job-command-identity',
				state: 'running'
			},
			statusPayload: {
				action: 'commandStatus',
				jobId: 'job-command-identity'
			}
		},
		Date.now(),
		() => ({ queued: 0, inflight: 0, workers: {} })
	);
	assert.equal(envelope.jobId, 'job-command-identity');
	assert.equal(envelope.workerId, 'worker-command-identity');
	assert.equal(envelope.receiptId, 'receipt-command-identity');
	assert.equal(envelope.worker.jobId, 'job-command-identity');
	assert.equal(envelope.statusPayload.jobId, 'job-command-identity');
	assert.ok(envelope.controlRequestId.startsWith('ctrl_'));
	assert.ok(envelope.clientRequestId.startsWith('client_'));
	assert.ok(envelope.nonce.startsWith('nonce_'));
	console.log(JSON.stringify({ ok: true, suite: 'command-envelope-identity' }, null, 2));
})();
