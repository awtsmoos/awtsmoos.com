// B"H
import assert from "assert";

const memory = new Map();
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };

const mod = await import("../selector.js");
const got = {
  browserDevices: [{
    tunnelId: "browser-id",
    tunnelName: "browser-one",
    deviceId: "browser-device",
    vesselType: "browser-tab",
    ownershipVerified: true,
    access: "owned",
    connected: true
  }],
  nativeDevices: [{
    tunnelId: "native-id",
    tunnelName: "native-one",
    deviceId: "native-device",
    vesselType: "native-tunnel",
    ownershipVerified: true,
    pairingProofVersion: 1,
    access: "owned",
    permissions: ["tunnel.read"],
    connected: true
  }],
  virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" },
  recommended: { tunnelId: "native-id", tunnelName: "native-one" }
};

const vessels = mod.collectVessels(got);
assert.deepStrictEqual(vessels.map(v => v.tunnelName), ["browser-one", "native-one", "awtsmoos-virtual-os"]);
assert.strictEqual(mod.chooseTargetVessel(got).tunnelName, "native-one");
mod.rememberTargetVessel("browser-one");
assert.strictEqual(mod.chooseTargetVessel(got).tunnelName, "browser-one");
assert.strictEqual(mod.currentTargetVesselName(), "browser-one");
assert(mod.labelForVessel({ tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" }).includes("Hosted Virtual OS"));
console.log("BHY vessel selector tests passed");
