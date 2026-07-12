// B"H
const assert = require('node:assert/strict');
const relay = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js');

function context() {
	const sent = [];
	return {
		sent,
		tunnels: new Map([['awt-test', { send: message => sent.push(message) }]]),
		pendingTunnelRequests: new Map(),
		clients: new Set()
	};
}

function response(id, fields = {}) {
	return { id, type: 'TUNNEL_RESPONSE', ...fields };
}

async function mismatchThenCorrect(ctx, payload, wrong, expectedFlag) {
	const waiting = relay.sendTunnelRequest(ctx, 'awt-test', payload, 5000);
	const [id, pending] = [...ctx.pendingTunnelRequests.entries()][0];
	assert.ok(id);
	assert.equal(relay.handleTunnelResponse(ctx, response(id, wrong)), false);
	assert.equal(ctx.pendingTunnelRequests.has(id), true);
	assert.equal(ctx.tunnelResponseQuarantine.length, 1);
	assert.equal(ctx.tunnelResponseQuarantine[0].response[expectedFlag], true);
	const exact = {
		action: pending.expected.requestedAction,
		tunnelName: pending.expected.tunnelName,
		controlRequestId: pending.expected.controlRequestId,
		logicalAgentId: pending.expected.logicalAgentId,
		nonce: pending.expected.nonce
	};
	assert.equal(relay.handleTunnelResponse(ctx, response(id, exact)), true);
	const result = await waiting;
	assert.equal(result.action, pending.expected.requestedAction);
	assert.equal(ctx.pendingTunnelRequests.size, 0);
	return result;
}

async function reverseOrder(count) {
	const ctx = context();
	const promises = [];
	for (let index = 0; index < count; index += 1) {
		promises.push(relay.sendTunnelRequest(ctx, 'awt-test', {
			action: index % 2 ? 'write' : 'readBytes',
			controlRequestId: `ctl_${index}`,
			logicalAgentId: `agent_${index}`,
			nonce: `nonce_${index}`
		}, 5000));
	}
	const entries = [...ctx.pendingTunnelRequests.entries()];
	assert.equal(entries.length, count);
	for (const [id, pending] of entries.reverse()) {
		relay.handleTunnelResponse(ctx, response(id, {
			action: pending.expected.requestedAction,
			tunnelName: pending.expected.tunnelName,
			controlRequestId: pending.expected.controlRequestId,
			logicalAgentId: pending.expected.logicalAgentId,
			nonce: pending.expected.nonce
		}));
	}
	const results = await Promise.all(promises);
	assert.equal(results.length, count);
	assert.equal(ctx.pendingTunnelRequests.size, 0);
	return count;
}

(async () => {
	await mismatchThenCorrect(context(), {
		action: 'readBytes',
		controlRequestId: 'ctl_action',
		nonce: 'nonce_action'
	}, {
		action: 'write',
		tunnelName: 'awt-test',
		controlRequestId: 'ctl_action',
		nonce: 'nonce_action'
	}, 'actionMismatch');
	await mismatchThenCorrect(context(), {
		action: 'readBytes',
		controlRequestId: 'ctl_nonce',
		nonce: 'nonce_expected'
	}, {
		action: 'readBytes',
		tunnelName: 'awt-test',
		controlRequestId: 'ctl_nonce',
		nonce: 'nonce_wrong'
	}, 'nonceMismatch');
	const stress = [];
	for (const count of [5, 10, 25, 50]) stress.push(await reverseOrder(count));
	console.log(JSON.stringify({ ok: true, suite: 'tunnel-correlation-quarantine', stress }, null, 2));
})().catch(error => {
	console.error(error);
	process.exit(1);
});
