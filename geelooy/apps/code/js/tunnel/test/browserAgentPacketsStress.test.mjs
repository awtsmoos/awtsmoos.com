// B"H
import assert from "assert";
import { codeBrowserRegistrationPacket } from "../browser-agent-packets.js";

for (let i = 0; i < 250; i++) {
  const fsActions = ["list", "read", "write", `custom-${i}`];
  const commandActions = ["commandRun", "shellCommand"];
  const previewActions = ["open", `reload-${i}`];
  const packet = codeBrowserRegistrationPacket({ tunnelName: `awt-browser-code-${i}`, fsActions, commandActions, previewActions, userAgent: `agent-${i}` });
  assert.strictEqual(packet.protocolVersion, "awtsmoos-tunnel-v2");
  assert.strictEqual(packet.vesselType, "browser-tab");
  assert.strictEqual(packet.browserAgent, true);
  assert.strictEqual(packet.allowCommands, false);
  assert.strictEqual(packet.allowSecrets, false);
  assert.strictEqual(packet.capabilities.commandRun, "simulated");
  assert.strictEqual(packet.capabilities.chrome, false);
  assert.deepStrictEqual(packet.capabilities.fsActions, fsActions);
  assert.deepStrictEqual(packet.tools.commandActions, commandActions);
  assert.deepStrictEqual(packet.tools.previewControl, previewActions);
  assert.strictEqual(packet.command.mode, "simulated");
}

console.log("BHY code browser packet stress tests passed 250");
