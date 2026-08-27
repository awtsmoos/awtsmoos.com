// B"H

const assert = require("node:assert/strict");
const Discovery = require("../deviceDiscovery.js");

const native = {
	tunnelId: "tun_offline_native",
	tunnelName: "awt-offline-native",
	connected: false,
	isAlive: false,
	kind: "native-tunnel"
};
const virtualDevice = {
	tunnelName: "awtsmoos-virtual-os",
	synthetic: true,
	kind: "virtual-os",
	isAlive: true
};

const selected = Discovery.recommend({
	liveBrowser: [],
	liveNative: [],
	nativeDevices: [native],
	virtualDevice
});
assert.equal(selected, native);
assert.equal(selected.connected, false);

const newAccount = Discovery.recommend({
	liveBrowser: [],
	liveNative: [],
	nativeDevices: [],
	virtualDevice
});
assert.equal(newAccount, virtualDevice);

console.log(JSON.stringify({
	ok: true,
	suite: "device-discovery-offline-native",
	offlineNativePreserved: true,
	virtualOnlyForAccountWithoutNative: true
}));
