// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Chapter 611: Two messengers reached the same gate.
 * The older messenger must bow and leave. If both keep charging back into the
 * doorway, launchd and foreground shells make an endless duel. This test guards
 * the future installer bundle from restoring that storm.
 */
const source = fs.readFileSync(path.resolve(__dirname, "../main.js"), "utf8");

assert(
  source.includes("TUNNEL_REPLACED"),
  "main.js must explicitly handle the relay replacement message"
);

assert(
  source.includes("exitBecauseNewerConnectionOwnsTunnel"),
  "main.js should route replacement through a named exit policy helper"
);

assert(
  source.includes("process.exit(0)"),
  "the older duplicate process must exit cleanly after replacement"
);

assert(
  !source.includes('scheduleReconnect("replaced_by_newer_connection")'),
  "replacement must not schedule reconnect; that recreates the duplicate loop"
);

assert(
  !source.includes("Tunnel replaced by newer connection; reconnecting."),
  "old replacement log text should not return"
);

console.log(JSON.stringify({ ok: true, suite: "replacement-exit-policy" }, null, 2));
