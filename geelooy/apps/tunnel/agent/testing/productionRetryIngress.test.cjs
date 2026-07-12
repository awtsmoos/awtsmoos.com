// B"H
const assert = require('node:assert/strict');
const Correlation = require('../lib/runtime/correlation.js');
const Registry = require('../lib/runtime/request-retry-registry.js');
const RetryControl = require('../lib/runtime/main-retry-control.js');

/** B"H — Ingress consumes retry and duplicate requests before the work queue. */
(() => {
	Registry.reset();
	const sent = [];
	const control = RetryControl.create({
		Registry,
		Correlation,
		Send: {
			safeSend(_ws, value) {
				sent.push(value);
				return true;
			}
		}
	});
	const ws = { opened: true };
	const data = { id: 'transport-original' };
	const payload = {
		action: 'read',
		controlRequestId: 'control-original'
	};
	assert.equal(control.handleIngress(ws, data, payload), false);
	assert.equal(Registry.snapshot().records, 1);
	const pendingRetry = {
		action: 'retryAction',
		params: JSON.stringify({
			controlRequestId: 'control-original',
			requestedAction: 'read'
		})
	};
	assert.equal(control.handleIngress(ws, { id: 'retry-pending' }, pendingRetry), true);
	assert.equal(sent.at(-1).status, 202);
	control.complete(data, payload, {
		ok: true,
		action: 'read',
		content: 'retained-result'
	});
	assert.equal(control.handleIngress(ws, { id: 'retry-complete' }, pendingRetry), true);
	assert.equal(sent.at(-1).content, 'retained-result');
	assert.equal(control.handleIngress(ws, { id: 'duplicate' }, payload), true);
	assert.equal(sent.at(-1).content, 'retained-result');
	assert.equal(Registry.snapshot().records, 1);
	console.log(JSON.stringify({
		ok: true,
		suite: 'production-retry-ingress',
		sent: sent.length,
		snapshot: Registry.snapshot()
	}, null, 2));
})();
