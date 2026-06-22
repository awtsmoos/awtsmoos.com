// B"H
const assert = require('assert');
const fsp = require('fs/promises');
const os = require('os');
const path = require('path');

const relay = require('../../../../../ayzarim/awtsmoosDynamicServer/websocket/apps/tunnelRelay.js');

function response(id, fields = {}) {
  return { id, type: 'TUNNEL_RESPONSE', ...fields };
}

async function simulateOne(ctx, name, payload, reply) {
  const promise = relay.sendTunnelRequest(ctx, name, payload, 5000);
  const [id, pending] = [...ctx.pendingTunnelRequests.entries()][0];
  assert.ok(id, 'pending id created');
  assert.ok(pending.expected.controlRequestId, 'expected controlRequestId stored');
  relay.handleTunnelResponse(ctx, response(id, reply));
  return await promise;
}

async function runRelayCorrelationUnit() {
  const sent = [];
  const ctx = {
    tunnels: new Map([['awt-test', { send: msg => sent.push(msg) }]]),
    pendingTunnelRequests: new Map(),
    clients: new Set()
  };
  const good = await simulateOne(ctx, 'awt-test', {
    action: 'readBytes',
    controlRequestId: 'ctl_good',
    nonce: 'nonce_good',
    logicalAgentId: 'agent_good'
  }, {
    action: 'readBytes',
    tunnelName: 'awt-test',
    controlRequestId: 'ctl_good',
    nonce: 'nonce_good',
    logicalAgentId: 'agent_good'
  });
  assert.equal(good.ok, undefined);
  assert.equal(good.action, 'readBytes');

  const badAction = await simulateOne(ctx, 'awt-test', {
    action: 'readBytes',
    controlRequestId: 'ctl_bad_action',
    nonce: 'nonce_bad_action'
  }, {
    action: 'write',
    tunnelName: 'awt-test',
    controlRequestId: 'ctl_bad_action',
    nonce: 'nonce_bad_action'
  });
  assert.equal(badAction.ok, false);
  assert.equal(badAction.correlationMismatch, true);
  assert.equal(badAction.actionMismatch, true);

  const badTunnel = await simulateOne(ctx, 'awt-test', {
    action: 'readBytes',
    controlRequestId: 'ctl_bad_tunnel',
    nonce: 'nonce_bad_tunnel'
  }, {
    action: 'readBytes',
    tunnelName: 'awtsmoos-virtual-os',
    controlRequestId: 'ctl_bad_tunnel',
    nonce: 'nonce_bad_tunnel'
  });
  assert.equal(badTunnel.ok, false);
  assert.equal(badTunnel.correlationMismatch, true);
  assert.equal(badTunnel.wrongTunnel, true);

  const badControl = await simulateOne(ctx, 'awt-test', {
    action: 'readBytes',
    controlRequestId: 'ctl_expected',
    nonce: 'nonce_expected'
  }, {
    action: 'readBytes',
    tunnelName: 'awt-test',
    controlRequestId: 'ctl_actual',
    nonce: 'nonce_expected'
  });
  assert.equal(badControl.ok, false);
  assert.equal(badControl.controlRequestMismatch, true);

  const badNonce = await simulateOne(ctx, 'awt-test', {
    action: 'readBytes',
    controlRequestId: 'ctl_nonce',
    nonce: 'nonce_expected'
  }, {
    action: 'readBytes',
    tunnelName: 'awt-test',
    controlRequestId: 'ctl_nonce',
    nonce: 'nonce_actual'
  });
  assert.equal(badNonce.ok, false);
  assert.equal(badNonce.nonceMismatch, true);

  return { sent: sent.length };
}

async function runConcurrentLogicalAgents(count) {
  const sent = [];
  const ctx = {
    tunnels: new Map([['awt-test', { send: msg => sent.push(msg) }]]),
    pendingTunnelRequests: new Map(),
    clients: new Set()
  };
  const promises = [];
  for (let i = 0; i < count; i++) {
    promises.push(relay.sendTunnelRequest(ctx, 'awt-test', {
      action: i % 2 ? 'write' : 'readBytes',
      controlRequestId: `ctl_${i}`,
      logicalAgentId: `agent_${i}`,
      nonce: `nonce_${i}`
    }, 5000));
  }
  const entries = [...ctx.pendingTunnelRequests.entries()];
  assert.equal(entries.length, count);
  entries.reverse().forEach(([id, pending]) => {
    relay.handleTunnelResponse(ctx, response(id, {
      action: pending.expected.requestedAction,
      tunnelName: pending.expected.tunnelName,
      controlRequestId: pending.expected.controlRequestId,
      logicalAgentId: pending.expected.logicalAgentId,
      nonce: pending.expected.nonce
    }));
  });
  const results = await Promise.all(promises);
  assert.equal(results.length, count);
  assert.ok(results.every(item => item.type === 'TUNNEL_RESPONSE'));
  assert.equal(ctx.pendingTunnelRequests.size, 0);
  return { count, sent: sent.length };
}

(async () => {
  const unit = await runRelayCorrelationUnit();
  const concurrencies = [5, 10, 25, 50];
  const stress = [];
  for (const count of concurrencies) stress.push(await runConcurrentLogicalAgents(count));
  const tmp = await fsp.mkdtemp(path.join(os.tmpdir(), 'awts-tunnel-correlation-proof-'));
  await fsp.writeFile(path.join(tmp, 'nonce.txt'), 'nonce=tunnel-correlation-stress-local-unit\n', 'utf8');
  console.log(JSON.stringify({ ok: true, suite: 'tunnel-correlation-stress-local-unit', unit, stress }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
