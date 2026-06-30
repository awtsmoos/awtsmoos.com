// B"H
const assert = require('assert');
const { connectedNames, deviceWarnings, isLiveDevice, liveDevices, staleDevices } = require('../liveDevices.js');
const devices = [
  { tunnelName: 'alive', isAlive: true, kind: 'native-tunnel' },
  { tunnelName: 'dead', isAlive: false, kind: 'native-tunnel' },
  { tunnelName: 'legacy-unknown', kind: 'browser-tab' }
];
assert.equal(isLiveDevice(devices[0]), true);
assert.equal(isLiveDevice(devices[1]), false);
assert.equal(isLiveDevice(devices[2]), true);
assert.deepEqual(liveDevices(devices).map(x => x.tunnelName), ['alive', 'legacy-unknown']);
assert.deepEqual(staleDevices(devices).map(x => x.tunnelName), ['dead']);
assert.deepEqual(connectedNames(devices), ['alive', 'legacy-unknown']);
assert.equal(deviceWarnings(devices, []).length, 1);
console.log('B"H liveDevices filters stale tunnels');
