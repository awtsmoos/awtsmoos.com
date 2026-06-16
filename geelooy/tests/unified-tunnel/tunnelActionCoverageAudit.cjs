// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const files = {
  nativeCatalog: path.join(ROOT, "apps/tunnel/agent/lib/tool-schema-catalog.js"),
  nativeActions: path.join(ROOT, "apps/tunnel/agent/tools/fs/actions.js"),
  browserPackets: path.join(ROOT, "apps/code/js/tunnel/browser-agent-packets.js"),
  browserPacketTests: path.join(ROOT, "apps/code/js/tunnel/test/browserAgentPackets.test.mjs"),
  browserPacketStress: path.join(ROOT, "apps/code/js/tunnel/test/browserAgentPacketsStress.test.mjs"),
  browserRegistrationSmoke: path.join(ROOT, "tests/unified-tunnel/browserTabRegistrationSmoke.test.mjs"),
  browserCommand: path.join(ROOT, "apps/code/js/tunnel/BrowserCommandAdapter.js"),
  sharedActions: path.join(ROOT, "shared/virtual-os/fs/actions.js"),
  commandContract: path.join(ROOT, "shared/virtual-os/command/CommandContract.js"),
  processRecord: path.join(ROOT, "shared/virtual-os/process/ProcessRecord.js"),
  tunnelPage: path.join(ROOT, "apps/tunnel/js/browserPageTunnel.js")
};
for (const file of Object.values(files)) assert(fs.existsSync(file), "exists: " + file);
const text = Object.fromEntries(Object.entries(files).map(([k, f]) => [k, fs.readFileSync(f, "utf8")]));
const browserActionEvidence = text.browserPackets + text.browserPacketTests + text.browserPacketStress + text.browserRegistrationSmoke;

const requiredFs = ["list", "tree", "read", "write", "bulk", "delete", "makeFolder", "commandRun"];
for (const action of requiredFs) assert(text.sharedActions.includes(action), "shared action: " + action);
for (const action of ["list", "read", "write", "tree", "bulk"]) assert(browserActionEvidence.includes(action), "browser packet/action tests cover: " + action);
for (const command of ["pwd", "ls", "cat", "head", "tail", "grep", "tree"]) {
  const single = `name === '${command}'`;
  const double = `name === "${command}"`;
  assert(text.browserCommand.includes(single) || text.browserCommand.includes(double), "browser command supports/simulates: " + command);
}
assert(text.commandContract.includes("commandOk"));
assert(text.commandContract.includes("assertCommandContract"));
assert(text.processRecord.includes("createProcessRecord"));
assert(text.tunnelPage.includes("BrowserStorageFsAdapter"), "/apps/tunnel executes shared BrowserStorage adapter");
assert(text.browserPackets.includes("codeBrowserRegistrationPacket"), "code browser registration helper exists");
assert(text.nativeCatalog.includes("schema"), "native tool schema catalog present");
assert(text.nativeActions.includes("command") || text.nativeActions.includes("read"), "native fs action dispatcher present");
console.log(JSON.stringify({ ok: true, suite: "tunnel-action-coverage-audit", checked: Object.keys(files), requiredFs, browserCommands: ["pwd", "ls", "cat", "head", "tail", "grep", "tree"] }, null, 2));
