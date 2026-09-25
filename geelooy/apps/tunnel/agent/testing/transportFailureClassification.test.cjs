// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Failure = require("../lib/ws/transportFailure.js");

// Regression: transport testimony arrives with underscores (remote_close_1000)
// or spaces (remote close); classification must recognize both so a clean
// server close is a "socket" ending (fast retry), never "unknown".

async function run() {
  const socket = (code, message) =>
    Failure.classify({ code, message }, "socket");

  // The production flap: server closes with code 1000, empty reason.
  let f = socket("websocket_remote_close_1000", "remote_close_1000");
  assert.equal(f.category, "socket");
  assert.equal(f.retryable, true);
  assert.equal(f.upstreamLikely, true);

  // Space-separated form must classify identically.
  f = socket("websocket_remote_close_1000", "remote close 1000");
  assert.equal(f.category, "socket");

  // Other separators must not regress.
  assert.equal(socket("EPIPE", "write EPIPE").category, "reset");
  assert.equal(
    socket("websocket_handshake_rejected", "websocket_handshake_rejected: HTTP/1.1 502 Bad Gateway").category,
    "proxy"
  );
  assert.equal(socket("socket_error", "socket_closed").category, "socket");
  assert.equal(socket("x", "invalid_device_credential rejected").category, "authentication");
  assert.equal(socket("x", "getaddrinfo ENOTFOUND awtsmoos.com").category, "dns");
  assert.equal(socket("x", "websocket_connect_timeout").category, "timeout");
  assert.equal(socket("x", "something totally weird").category, "unknown");

  // categoryFor is directly usable for unit checks.
  assert.equal(Failure.categoryFor("remote_close_1000", "socket"), "socket");
  assert.equal(Failure.categoryFor("remote close 1000", "socket"), "socket");
}

run().then(() => {
  console.log(JSON.stringify({
    ok: true,
    suite: "transport-failure-classification"
  }, null, 2));
}).catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
