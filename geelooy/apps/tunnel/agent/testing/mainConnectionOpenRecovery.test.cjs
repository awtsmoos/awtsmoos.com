// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const Open = require("../lib/runtime/main-connection-open.js");

/**
 * B"H
 * Socket-open initialization either arms recovery completely or terminates the
 * half-open generation. Diagnostic receipt failure alone remains non-fatal.
 */
const activityFailure = createCase();
const activityResult = initialize(activityFailure, {
	activityBinder() {
		throw new Error("activity_bind_failed");
	}
});
assert.equal(activityResult.ok, false);
assert.deepEqual(activityFailure.terminalReasons, [
	"socket_open_initialization_failed:activity_bind_failed"
]);

const watchdogFailure = createCase();
let activityReleased = 0;
const watchdogResult = initialize(watchdogFailure, {
	activityBinder() {
		return () => {
			activityReleased += 1;
		};
	},
	registrationStarter() {
		throw new Error("watchdog_start_failed");
	}
});
assert.equal(watchdogResult.ok, false);
assert.equal(activityReleased, 1);
assert.equal(watchdogFailure.terminalReasons.length, 1);

const receiptFailure = createCase();
receiptFailure.dependencies.Receipt.write = () => {
	throw new Error("receipt_write_failed");
};
let watchdogStarted = 0;
const receiptResult = initialize(receiptFailure, {
	activityBinder: () => () => {},
	registrationStarter() {
		watchdogStarted += 1;
		return { stop() {} };
	}
});
assert.equal(receiptResult.ok, true);
assert.equal(watchdogStarted, 1);
assert.deepEqual(receiptFailure.terminalReasons, []);

const normalCase = createCase();
let released = 0;
const normalResult = initialize(normalCase, {
	activityBinder: () => () => {
		released += 1;
	},
	registrationStarter: () => ({
		stop() {
			released += 1;
		}
	})
});
assert.equal(normalResult.ok, true);
normalResult.release();
normalResult.release();
assert.equal(released, 2);

console.log(JSON.stringify({
	ok: true,
	suite: "main-connection-open-recovery",
	activityFailureRecovered: true,
	watchdogFailureRecovered: true,
	receiptFailureNonFatal: true
}, null, 2));

function initialize(testCase, overrides) {
	return Open.initializeConnectionOpen({
		dependencies: testCase.dependencies,
		ws: testCase.socket,
		config: { tunnelName: "awt-open-test" },
		generation: 4,
		owns: () => true,
		terminate(reason) {
			testCase.terminalReasons.push(reason);
		},
		...overrides
	});
}

function createCase() {
	return {
		socket: { opened: true },
		terminalReasons: [],
		dependencies: {
			state: {
				wasEverConnected: false,
				reconnectAttempt: 3
			},
			Control: { markSeen() {} },
			Receipt: { write() {} },
			registerReady() {},
			log() {}
		}
	};
}
