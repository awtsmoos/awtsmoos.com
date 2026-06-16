// B"H
import assert from "assert";
import { CODE_BROWSER_TUNNEL_VERSION, codeBrowserRegistrationPacket, codeBrowserTunnelTools } from "../browser-agent-packets.js";

const fsActions = ["list", "read", "write", "tree"];
const commandActions = ["commandRun", "shellCommand"];
const previewActions = ["open", "reload"];

const tools = codeBrowserTunnelTools({ fsActions, commandActions, previewActions });
assert.strictEqual(tools.command, "simulated");
assert.strictEqual(tools.chrome, false);
assert.deepStrictEqual(tools.fsAdvanced, fsActions);
assert.deepStrictEqual(tools.commandActions, commandActions);
assert.deepStrictEqual(tools.previewControl, previewActions);

const packet = codeBrowserRegistrationPacket({ tunnelName: "awt-browser-code-test", fsActions, commandActions, previewActions, userAgent: "test-agent" });
assert.strictEqual(packet.type, "TUNNEL_REGISTER");
assert.strictEqual(packet.protocolVersion, "awtsmoos-tunnel-v2");
assert.strictEqual(packet.tunnelName, "awt-browser-code-test");
assert.strictEqual(packet.vesselType, "browser-tab");
assert.strictEqual(packet.browserAgent, true);
assert.strictEqual(packet.allowWrite, true);
assert.strictEqual(packet.allowSecrets, false);
assert.strictEqual(packet.allowCommands, false);
assert.strictEqual(packet.agentVersion, CODE_BROWSER_TUNNEL_VERSION);
assert.strictEqual(packet.capabilities.commandRun, "simulated");
assert.strictEqual(packet.capabilities.chrome, false);
assert.deepStrictEqual(packet.capabilities.fsActions, fsActions);
assert.deepStrictEqual(packet.capabilities.previewControl, previewActions);
assert.throws(() => codeBrowserRegistrationPacket({}), /code_browser_tunnel_name_required/);

console.log("BHY code browser tunnel packet tests passed");
