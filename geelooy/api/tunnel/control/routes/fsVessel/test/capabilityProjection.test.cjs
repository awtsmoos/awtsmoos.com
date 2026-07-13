//B"H
//Boruch Hashem
//Blessed is He

const assert = require("assert");
const {
	capabilityFor
} = require("../capabilities");
const {
	publicTunnelClient
} = require("../tunnelClient");
const {
	vesselTypeFor
} = require("../vesselTypes");
const {
	virtualClient
} = require("../virtualClient");

/**
 * B"H
 *
 * Server projection must prefer declared capability states over permissive
 * compatibility flags. The Awtsmoos creates declaration and observer together;
 * Awtsmoos.com proves that hosted, browser, and connected OS remain distinct.
 */

const declared = {
	tunnelName: "browser-one",
	deviceName: "Apps Code",
	vesselType: "browser-tunnel",
	browserAgent: true,
	allowWrite: false,
	allowCommands: true,
	capabilityProfile: {
		schemaVersion: 1,
		vesselType: "browser-tunnel",
		implementation: "apps-code-browser-agent",
		capabilities: {
			"fs.read": capability("virtualized"),
			"fs.write": capability("virtualized"),
			"command.run": capability("simulated"),
			"runtime.execute": capability("virtualized"),
			"browser.control": capability("unsupported"),
			"native.access": capability("delegated")
		}
	}
};
const projected = capabilityFor("browser-tunnel", declared);
assert.equal(projected.fsRead, true);
assert.equal(projected.fsWrite, true);
assert.equal(projected.commandRun, "simulated");
assert.equal(projected.runtime, "virtualized");
assert.equal(projected.chrome, false);
assert.equal(projected.nativeAccess, "delegated");

const publicClient = publicTunnelClient(declared);
assert.equal(publicClient.vesselType, "browser-tunnel");
assert.equal(publicClient.capabilityProfile.schemaVersion, 1);
assert.equal(publicClient.capabilities.commandRun, "simulated");
assert.equal(publicClient.allowWrite, false);

assert.equal(vesselTypeFor({
	browserAgent: true,
	virtualOs: true
}), "virtual-os-tunnel");
assert.equal(vesselTypeFor({
	hostedVirtualOs: true
}), "hosted-virtual-os");

const hosted = virtualClient();
assert.equal(hosted.tunnelName, "virtual-os");
assert.equal(hosted.vesselType, "hosted-virtual-os");
assert.equal(hosted.hostedVirtualOs, true);
assert.equal(hosted.virtualOs, false);
assert.equal(hosted.capabilityProfile.capabilities["fs.write"].state,
	"virtualized");
assert.equal(capabilityFor(hosted.vesselType, hosted).desktopControl, false);

const legacy = capabilityFor("native-tunnel", {
	allowWrite: true,
	allowCommands: false,
	chrome: true
});
assert.deepEqual(legacy, {
	vesselType: "native-tunnel",
	fsRead: true,
	fsWrite: true,
	commandRun: false,
	chrome: true,
	runtime: true
});
console.log("BHY server capability projection tests passed");

function capability(state) {
	return { state, mode: "", reason: "", actions: [] };
}
