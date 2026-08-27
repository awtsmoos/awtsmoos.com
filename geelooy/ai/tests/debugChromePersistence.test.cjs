// B"H

const assert = require("node:assert/strict");
const test = require("node:test");
const { openDebugChrome } = require("../relay/split-browser/cdpChrome.cjs");

test("transient DevTools failure preserves a reused profile owner", async () => {
	let terminations = 0;
	let launches = 0;
	const result = await openDebugChrome({}, {
		status: async () => ({ ok: false, error: "temporarily_busy" }),
		launch: async () => {
			launches += 1;
			return { ok: true, reused: true, debugPort: 9223 };
		},
		wait: async () => ({ ok: false, error: "temporarily_busy" }),
		closeStale: async () => { terminations += 1; return { closed: 1 }; }
	});
	assert.equal(result.status, "debug_chrome_reused_owner_unresponsive");
	assert.equal(result.ownerPreserved, true);
	assert.equal(result.recoveryAttempted, false);
	assert.equal(launches, 1);
	assert.equal(terminations, 0);
});

test("ready reused browser never grants resistant-tab process termination", async () => {
	let terminateOnResistance = null;
	const result = await openDebugChrome({}, readyFixture(value => {
		terminateOnResistance = value;
	}));
	assert.equal(result.ok, true);
	assert.equal(terminateOnResistance, false);
});

test("newly launched browser grants bounded failed-start recovery", async () => {
	let terminateOnResistance = null;
	let statuses = 0;
	const fixture = readyFixture(value => { terminateOnResistance = value; });
	fixture.status = async () => ({ ok: ++statuses > 1, debugPort: 9223 });
	fixture.launch = async () => ({ ok: true, reused: false, debugPort: 9223 });
	fixture.wait = async () => ({ ok: true, debugPort: 9223 });
	const result = await openDebugChrome({}, fixture);
	assert.equal(result.ok, true);
	assert.equal(terminateOnResistance, true);
});

function readyFixture(captureTermination) {
	return {
		status: async () => ({ ok: true, debugPort: 9223 }),
		purge: async options => {
			captureTermination(options.terminateOnResistance);
			return { ok: true, closed: 0, remaining: 0 };
		},
		keeper: async () => ({ ok: true, keeperId: "keeper" }),
		findBrowser: async () => ({ ok: true, debugPort: 9223 })
	};
}
