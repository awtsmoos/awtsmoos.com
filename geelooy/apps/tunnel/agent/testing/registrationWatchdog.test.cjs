// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Harness = require("./helpers/registrationWatchdogHarness.cjs");

/**
 * B"H
 * Missing acknowledgements report one terminal timeout to the owning runtime.
 * Callback, fallback close, acknowledgement, and stale generation are proven.
 */
const timeoutCase = Harness.createCase();
const timeoutWatchdog = Harness.start(timeoutCase, true);
timeoutCase.runNext();
timeoutCase.runNext();
timeoutCase.runNext();
assert.equal(timeoutWatchdog.attempts(), 3);
assert.equal(timeoutCase.timeouts, 1);
assert.equal(timeoutCase.socket.closedWith, undefined);
assert.equal(timeoutCase.receipts.at(-1).type, "registration_ack_timeout");

const fallbackCase = Harness.createCase();
Harness.start(fallbackCase, false);
fallbackCase.runNext();
fallbackCase.runNext();
fallbackCase.runNext();
assert.equal(fallbackCase.socket.closedWith, true);

const acknowledgedCase = Harness.createCase();
Harness.start(acknowledgedCase, true);
acknowledgedCase.dependencies.state.registrationConfirmed = true;
acknowledgedCase.runNext();
assert.equal(acknowledgedCase.registrations, 1);
assert.equal(acknowledgedCase.timeouts, 0);

const staleCase = Harness.createCase();
Harness.start(staleCase, true);
staleCase.owned = false;
staleCase.runNext();
assert.equal(staleCase.registrations, 1);
assert.equal(staleCase.timeouts, 0);

console.log(JSON.stringify({
	ok: true,
	suite: "registration-watchdog",
	timeoutAttempts: timeoutWatchdog.attempts(),
	timeoutCallbacks: timeoutCase.timeouts,
	fallbackClose: fallbackCase.socket.closedWith
}, null, 2));
