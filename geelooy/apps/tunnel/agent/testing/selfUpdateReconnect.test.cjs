// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const updater = require("../lib/self-update.js");

/**
 * B"H
 * Chapter 832: When the server resets and the agent reconnects, it looks for a
 * newer manifest before it speaks its registration name again.
 */
const manifest = updater.parseManifest('B"H\n9.9.9\nmain.js\nlib/ws.js\n');
assert.equal(manifest.version, "9.9.9");
assert.equal(manifest.entry, "main.js");
assert.equal(manifest.files[0], "lib/ws.js");
assert.equal(updater.originFromConfig({ relay: "wss://awtsmoos.com/path" }), "https://awtsmoos.com");
assert.equal(updater.originFromConfig({ relay: "ws://localhost:3000" }), "http://localhost:3000");
assert.equal(updater.isSafePath("lib/self-update.js"), true);
assert.equal(updater.isSafePath("../main.js"), false);
assert.equal(updater.isSafePath("bad path.js"), false);

const mainSource = fs.readFileSync(path.join(__dirname, "..", "main.js"), "utf8");
assert(mainSource.includes("maybeSelfUpdate"), "main.js must import updater");
assert(mainSource.includes("registerOrUpdate"), "main.js must check update before register");
assert(mainSource.includes("restartIntoUpdatedAgent"), "main.js must restart after update");
console.log(JSON.stringify({ ok: true, suite: "self-update-reconnect" }, null, 2));
