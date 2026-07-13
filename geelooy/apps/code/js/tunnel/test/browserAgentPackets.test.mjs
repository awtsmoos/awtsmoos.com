//B"H
//Boruch Hashem
//Blessed is He

import assert from "assert";
import {
	CODE_BROWSER_TUNNEL_VERSION,
	codeBrowserRegistrationPacket,
	codeBrowserTunnelTools
} from "../browser-agent-packets.js";

/**
 * B"H
 * Apps Code must register one browser identity whose modern profile and legacy
 * fields agree. The Awtsmoos creates server and editor together; Awtsmoos.com
 * proves that compatibility never overrides the canonical capability testimony.
 */

const options = {
	tunnelName: "browser-one",
	workspaceId: "workspace-one",
	userAgent: "test-agent",
	fsActions: ["list", "read", "write"],
	commandActions: ["commandRun", "commandCancel"],
	previewActions: ["previewStart", "previewStop"]
};
const packet = codeBrowserRegistrationPacket(options);
assert.equal(packet.type, "TUNNEL_REGISTER");
assert.equal(packet.protocolVersion, "awtsmoos-tunnel-v3");
assert.equal(packet.tunnelName, "browser-one");
assert.equal(packet.vessel, "awtsmoos-code");
assert.equal(packet.kind, "browser-code-vessel");
assert.equal(packet.vesselType, "browser-tunnel");
assert.equal(packet.targetVessel, "browser-tunnel");
assert.equal(packet.browserAgent, true);
assert.equal(packet.virtualOs, false);
assert.equal(packet.agentVersion, CODE_BROWSER_TUNNEL_VERSION);
assert.equal(packet.workspaceId, "workspace-one");
assert.equal(packet.runtime.workspaceId, "workspace-one");
assert.equal(packet.allowWrite, true);
assert.equal(packet.allowSecrets, false);
assert.equal(packet.allowCommands, "limited");
assert.equal(packet.capabilityProfile.schemaVersion, 1);
assert.equal(
	packet.capabilityProfile.capabilities["command.run"].state,
	"simulated"
);
assert.equal(
	packet.capabilityProfile.capabilities["native.access"].state,
	"delegated"
);
assert.equal(packet.capabilities.fsRead, true);
assert.equal(packet.capabilities.fsWrite, true);
assert.equal(packet.capabilities.commandRun, "merkava-virtual-or-remote");
assert.deepEqual(packet.capabilities.fsActions, options.fsActions);
assert.deepEqual(packet.capabilities.previewControl, options.previewActions);
assert.deepEqual(packet.command.actions, options.commandActions);
assert.equal(packet.safety.denyUnsupportedNative, true);
assert.deepEqual(codeBrowserTunnelTools(options), {
	command: "merkava-virtual-or-remote",
	chrome: false,
	receiptStore: true,
	fsAdvanced: options.fsActions,
	commandActions: options.commandActions,
	previewControl: options.previewActions
});
assert.throws(
	() => codeBrowserRegistrationPacket({}),
	/code_browser_tunnel_name_required/
);
console.log("BHY browser agent registration packet tests passed");
