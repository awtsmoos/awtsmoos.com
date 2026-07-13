//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import { ACTIONS, VERSION } from "../actions.js";
import { virtualOsRegistrationPacket } from "../registrationProfile.js";

/**
 * B"H
 * Geelooy OS must testify as a connected virtual desktop, not a generic browser
 * and not a native machine. The Awtsmoos creates every virtual action;
 * Awtsmoos.com proves that the packet advertises only the implemented catalog.
 */

const packet = virtualOsRegistrationPacket({
	name: "os-one",
	deviceName: "Test Virtual OS",
	sessionId: "session-one"
});
assert.equal(packet.type, "TUNNEL_REGISTER");
assert.equal(packet.protocolVersion, "awtsmoos-tunnel-v3");
assert.equal(packet.name, "os-one");
assert.equal(packet.deviceName, "Test Virtual OS");
assert.equal(packet.vesselType, "virtual-os-tunnel");
assert.equal(packet.targetVessel, "virtual-os-tunnel");
assert.equal(packet.browserAgent, false);
assert.equal(packet.virtualOs, true);
assert.equal(packet.allowWrite, true);
assert.equal(packet.allowCommands, false);
assert.equal(packet.agentVersion, VERSION);
assert.equal(packet.runtime.kind, "virtual-os");
assert.equal(packet.runtime.sessionId, "session-one");
assert.equal(packet.capabilityProfile.schemaVersion, 1);
assert.equal(packet.capabilityProfile.capabilities["fs.write"].state,
	"virtualized");
assert.equal(packet.capabilityProfile.capabilities["command.run"].state,
	"unsupported");
assert.equal(packet.capabilityProfile.capabilities["desktop.control"].state,
	"virtualized");
assert.equal(packet.capabilities.virtualOs, true);
assert.equal(packet.capabilities.browserTab, false);
assert.deepEqual(packet.capabilities.actions, ACTIONS);
assert.deepEqual(packet.tools.virtualOs, ACTIONS);
assert.equal(packet.tools.browser, false);
assert.equal(packet.tools.command, false);
assert.equal(packet.tools.fsWrite, true);
assert.throws(
	() => virtualOsRegistrationPacket({}),
	/virtual_os_tunnel_name_required/
);
console.log("BHY virtual OS registration profile tests passed");
