// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Failure = require("../lib/ws/transportFailure.js");
const History = require("../lib/ws/transportFailureHistory.js");

// Regression: transport testimony arrives with underscores (remote_close_1000)
// or spaces (remote close); classification must recognize both so a clean
// server close is a "socket" ending (fast retry), never "unknown".
async function runSeparatorRegression() {
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

/**
 * Proves network wounds remain distinct from auth, config, protocol, and local wounds.
 *
 * The Awtsmoos names a vanished route without inventing a rejected identity.
 * Awtsmoos.com treats bare remote close as retryable socket testimony while hard
 * local/configuration failures remain distinct vessels for supervisor judgment.
 */
async function runCategoryTable() {
  const cases = [
    [{ code: "ENOTFOUND", message: "dns lookup" }, "dns"],
    [{ code: "EHOSTUNREACH", message: "host unreachable" }, "network"],
    [{ code: "ECONNRESET", message: "socket hang up" }, "reset"],
    [{ message: "socket_closed" }, "socket"],
    [{ code: "ETIMEDOUT", message: "connect timeout" }, "timeout"],
    [{ message: "HTTP/1.1 502 Bad Gateway" }, "proxy"],
    [{ code: "CERT_HAS_EXPIRED", message: "certificate expired" }, "certificate"],
    [{ code: "websocket_accept_mismatch", message: "protocol mismatch" }, "protocol"],
    [{ code: "event_loop_stall", message: "scheduler stall" }, "liveness"],
    [{ message: "invalid_device_credential" }, "authentication"],
    [{ message: "invalid url" }, "configuration"]
  ];
  const failures = cases.map(([error, category]) => {
    const result = Failure.classify(error, "connect");
    assert.equal(result.category, category);
    return result;
  });
  const history = failures.reduce((items, failure) => History.append(items, failure, 5), []);
  assert.equal(history.length, 5);
  assert.equal(History.summary(history).count, 5);

  const remoteClose = Failure.classify("socket_closed", "socket");
  assert.equal(remoteClose.retryable, true);
  assert.equal(remoteClose.upstreamLikely, true);
  assert.equal(remoteClose.localLikely, false);
  assert.equal(remoteClose.code, "transport_socket");

  const rejectedCredential = Failure.classify("invalid_device_credential", "registration");
  assert.equal(rejectedCredential.category, "authentication");
  assert.equal(rejectedCredential.phase, "registration");
  assert.equal(rejectedCredential.code, "invalid_device_credential");

  const invalidUrl = Failure.classify("invalid url", "connect");
  assert.equal(invalidUrl.retryable, false);
  assert.equal(invalidUrl.localLikely, true);

  return cases.map(([, category]) => category);
}

runSeparatorRegression()
  .then(runCategoryTable)
  .then((categories) => {
    console.log(JSON.stringify({
      ok: true,
      suite: "transport-failure-classification",
      categories,
      remoteCloseRecoverable: true,
      hardFailuresDistinct: true
    }, null, 2));
  })
  .catch((error) => {
    console.error(error.stack || error.message);
    process.exitCode = 1;
  });
