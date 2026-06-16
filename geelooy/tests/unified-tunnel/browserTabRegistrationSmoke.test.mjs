// B"H
import assert from "assert";
import { codeBrowserRegistrationPacket } from "../../apps/code/js/tunnel/browser-agent-packets.js";

const packet = codeBrowserRegistrationPacket({
  tunnelName: "awt-browser-code-smoke",
  fsActions: ["list", "read", "write", "tree", "bulk"],
  commandActions: ["command", "commandRun", "shellCommand", "run_terminal_command"],
  previewActions: ["open", "reload"],
  userAgent: "node-simulated-code-tab"
});

const clients = [
  { isTunnel: true, isAlive: true, tunnelName: "native-one", vesselType: "native-tunnel", allowCommands: true, allowWrite: true },
  { isTunnel: true, isAlive: true, tunnelName: packet.tunnelName, name: packet.name, vesselType: packet.vesselType, browserAgent: packet.browserAgent, allowCommands: packet.allowCommands, allowWrite: packet.allowWrite, capabilities: packet.capabilities, tools: packet.tools }
];

const browser = clients.find(x => x.browserAgent && x.vesselType === "browser-tab");
assert(browser, "browser tab registered");
assert.strictEqual(browser.tunnelName, "awt-browser-code-smoke");
assert.strictEqual(browser.allowCommands, false);
assert.strictEqual(browser.capabilities.commandRun, "simulated");
assert.strictEqual(browser.capabilities.chrome, false);
assert(browser.capabilities.fsActions.includes("write"));
assert(browser.tools.commandActions.includes("run_terminal_command"));
assert.strictEqual(browser.tools.chrome, false);
assert.strictEqual(browser.tools.nodeScript, "browser-simulated");

const recommended = clients.filter(x => x.vesselType === "browser-tab");
assert.strictEqual(recommended.length, 1);
console.log("BHY browser tab registration smoke passed");
