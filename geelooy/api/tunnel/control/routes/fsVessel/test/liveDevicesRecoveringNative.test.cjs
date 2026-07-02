// B"H
const assert = require('assert');
const Live = require('../liveDevices.js');
const recentNative = { tunnelName:'awt-live-recovering', isAlive:false, kind:'native-tunnel', registeredAt:Date.now() };
const ancientNative = { tunnelName:'awt-dead-old', isAlive:false, kind:'native-tunnel', registeredAt:Date.now() - 48 * 60 * 60 * 1000 };
assert.equal(Live.isLiveDevice(recentNative), true);
assert.equal(Live.isRecoveringNative(recentNative), true);
assert.equal(Live.isLiveDevice(ancientNative), false);
assert.deepEqual(Live.connectedNames([recentNative, ancientNative]), ['awt-live-recovering']);
console.log(JSON.stringify({ ok:true, suite:'live-devices-recovering-native' }, null, 2));
