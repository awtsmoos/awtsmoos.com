// B"H
import assert from "assert";

const memory = new Map();
global.localStorage = { getItem(key) { return memory.get(key) || null; }, setItem(key, value) { memory.set(key, String(value)); } };

const mod = await import("../selector.js");
const got = {
  browserDevices: [{ tunnelName: "browser-one", vesselType: "browser-tab" }],
  nativeDevices: [{ tunnelName: "native-one", vesselType: "native-tunnel", root: "/repo" }],
  virtualDevice: { tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" },
  recommended: { tunnelName: "native-one", vesselType: "native-tunnel" }
};

const vessels = mod.collectVessels(got);
assert.deepStrictEqual(vessels.map(v => v.tunnelName), ["browser-one", "native-one", "awtsmoos-virtual-os"]);
assert.strictEqual(mod.chooseTargetVessel(got).tunnelName, "native-one");
mod.rememberTargetVessel("browser-one");
assert.strictEqual(mod.chooseTargetVessel(got).tunnelName, "browser-one");
assert.strictEqual(mod.currentTargetVesselName(), "browser-one");
assert(mod.labelForVessel({ tunnelName: "awtsmoos-virtual-os", vesselType: "virtual-os" }).includes("Hosted Virtual OS"));
console.log("BHY vessel selector tests passed");
