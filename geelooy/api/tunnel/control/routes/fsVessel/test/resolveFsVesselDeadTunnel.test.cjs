// B"H
const assert = require('assert');
const { resolveFsVessel } = require('../resolveFsVessel.js');
const deadClient = { isTunnel: true, tunnelName: 'dead-native', isAlive: false, root: '/tmp', allowWrite: true, allowCommands: true };
const liveClient = { isTunnel: true, tunnelName: 'live-native', isAlive: true, root: '/tmp', allowWrite: true, allowCommands: true };
function ctx(clients) { return { ws: { clients, sendTunnelRequest() { throw new Error('should_not_route_to_dead_tunnel'); } } }; }
(async () => {
  const stale = resolveFsVessel({ $i: ctx([deadClient]), userId: 'u', tunnelName: 'dead-native', payload: { action: 'list' }, timeoutMs: 1 });
  const staleResult = await stale.send();
  assert.equal(staleResult.ok, false);
  assert.equal(staleResult.error, 'tunnel_not_alive');
  assert.equal(staleResult.status, 409);
  assert.equal(staleResult.connectedTunnels.length, 0);
  const auto = resolveFsVessel({ $i: ctx([deadClient]), userId: 'u', tunnelName: 'auto', payload: { action: 'list' }, timeoutMs: 1 });
  assert.equal(auto.tunnelName, 'awtsmoos-virtual-os');
  assert.equal(auto.reason, 'auto_virtual_os');
  const live = resolveFsVessel({ $i: ctx([liveClient]), userId: 'u', tunnelName: 'auto', payload: { action: 'list' }, timeoutMs: 1 });
  assert.equal(live.tunnelName, 'live-native');
  console.log('B"H resolver refuses dead tunnels before relay timeout');
})().catch(error => { console.error(error); process.exit(1); });
