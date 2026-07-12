// B"H
const assert = require('node:assert/strict');
const Registry = require('../lib/runtime/request-retry-registry.js');
const Priority = require('../lib/runtime/priority.js');

/** B"H — Retry observes one operation, never a second execution. */
(() => {
	Registry.reset();
	const original = {
		data: { id: 'transport-one' },
		payload: {
			action: 'read',
			controlRequestId: 'control-one'
		}
	};
	const first = Registry.begin(original);
	const duplicate = Registry.begin(original);
	assert.equal(first.kind, 'created');
	assert.equal(duplicate.kind, 'coalesced');
	assert.equal(Registry.snapshot().records, 1);
	const pending = Registry.poll({
		payload: {
			action: 'retryAction',
			params: JSON.stringify({
				controlRequestId: 'control-one',
				requestedAction: 'read'
			})
		}
	});
	assert.equal(pending.status, 202);
	assert.equal(pending.controlRequestId, 'control-one');
	assert.equal(pending.retryPayload.controlRequestId, 'control-one');
	Registry.complete('control-one', {
		ok: true,
		action: 'read',
		content: 'original-result'
	});
	const completed = Registry.poll({
		payload: {
			action: 'retryAction',
			controlRequestId: 'control-one',
			requestedAction: 'read'
		}
	});
	assert.equal(completed.content, 'original-result');
	assert.equal(completed.retryOf, 'control-one');
	const conflict = Registry.poll({
		payload: {
			action: 'retryAction',
			controlRequestId: 'control-one',
			requestedAction: 'write'
		}
	});
	assert.equal(conflict.error, 'retry_action_conflict');
	assert.equal(Priority.laneForAction('retryAction', 'fs'), Priority.LANES.P0);
	console.log(JSON.stringify({
		ok: true,
		suite: 'production-retry-registry',
		snapshot: Registry.snapshot()
	}, null, 2));
})();
