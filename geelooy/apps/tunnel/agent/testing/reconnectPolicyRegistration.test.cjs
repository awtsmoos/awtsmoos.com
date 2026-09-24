// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Policy = require("../lib/runtime/main-reconnect-policy.js");
const Failure = require("../lib/ws/transportFailure.js");

// Regression: a relay-accepted registration proves the route is healthy, so
// reconnect pressure must reset. Otherwise a storm of server-side closes
// (each followed by a successful registration) accumulates backoff without
// bound, turning brief blips into long outages.

async function run() {
  const serverClose = () =>
    Failure.classify({ code: "websocket_remote_close_1000", message: "remote_close_1000" }, "socket");

  // Clean server closes are fast-retry socket endings.
  assert.equal(serverClose().category, "socket");
  assert.equal(Policy.defaultMaximumForFailure(serverClose()), 5000);

  // Simulate ten flap cycles: close -> reconnect -> registration accepted.
  const state = {};
  for (let cycle = 0; cycle < 10; cycle++) {
    const failure = serverClose();
    state.lastFailure = failure;
    const attempt = Policy.nextAttempt(state);
    const delay = Policy.delayForAttempt(attempt, { failure, random: () => 0.5 });
    Policy.markRegistered(state); // relay accepted the registration
    if (cycle === 9) {
      assert.equal(state.reconnectAttempt, 0);
      assert.ok(delay <= 1500, `delay after reset should stay near base, got ${delay}`);
    }
  }

  // Unknown and proxy failures keep the restrained 30s ceiling.
  assert.equal(Policy.defaultMaximumForFailure({ category: "unknown" }), 30000);
  assert.equal(Policy.defaultMaximumForFailure({ category: "proxy" }), 30000);

  // A sick route (registrations never accepted) still accumulates backoff.
  const sick = {};
  for (let i = 0; i < 10; i++) Policy.nextAttempt(sick);
  const sickDelay = Policy.delayForAttempt(Policy.nextAttempt(sick), {
    failure: { category: "proxy" },
    random: () => 0.5,
  });
  assert.ok(sickDelay >= 20000, `sick route backoff should grow, got ${sickDelay}`);

  // markAccepted still resets pressure for control deeds.
  const accepted = { reconnectAttempt: 7 };
  Policy.markAccepted(accepted);
  assert.equal(accepted.reconnectAttempt, 0);
}

run().then(() => {
  console.log(JSON.stringify({
    ok: true,
    suite: "reconnect-policy-registration"
  }, null, 2));
}).catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
